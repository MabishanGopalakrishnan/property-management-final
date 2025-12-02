"""
Authentication Router
Handles user registration, login, and profile management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
import secrets
import string

from ..database import get_db
from ..models import User, Tenant
from ..schemas import UserCreate, UserLogin, Token, UserBasic, RoleEnum
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


class GoogleAuthRequest(BaseModel):
    credential: str
    role: str = None


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # If user is a tenant, create tenant record
    if new_user.role == "TENANT":
        tenant = Tenant(userId=new_user.id)
        db.add(tenant)
        db.commit()
    
    # Create access token
    access_token = create_access_token(data={"sub": new_user.email})
    
    # Prepare user response
    user_basic = UserBasic.model_validate(new_user)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_basic
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    
    # Prepare user response
    user_basic = UserBasic.model_validate(user)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_basic
    )


@router.get("/me", response_model=UserBasic)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return UserBasic.model_validate(current_user)


@router.get("/verify")
async def verify_token(current_user: User = Depends(get_current_user)):
    """Verify if the token is valid"""
    return {
        "valid": True,
        "user": UserBasic.model_validate(current_user)
    }


@router.post("/google", response_model=Token)
async def google_login_or_register(google_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Handle Google OAuth login or registration"""
    
    print(f"🔵 Google auth request received: credential={google_data.credential[:30]}..., role={google_data.role}")
    
    if not google_data.credential:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Google credential"
        )
    
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth not configured"
        )
    
    try:
        print(f"🔵 Verifying Google token with client ID: {GOOGLE_CLIENT_ID[:30]}...")
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            google_data.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        
        email = idinfo.get("email")
        name = idinfo.get("name") or idinfo.get("given_name") or "Google User"
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account has no email"
            )
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        # If user doesn't exist and no role provided (login), don't auto-register
        if not user and not google_data.role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found for this Google email. Please register first."
            )
        
        # If user doesn't exist and role is provided (register), create them
        if not user and google_data.role:
            # Normalize role
            role = google_data.role.upper() if google_data.role else "TENANT"
            if role not in ["TENANT", "LANDLORD", "ADMIN"]:
                role = "TENANT"
            
            # Generate random password (not used for Google auth)
            random_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(16))
            hashed_password = hash_password(random_password)
            
            user = User(
                email=email,
                name=name,
                role=role,
                password=hashed_password
            )
            
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # If user is a tenant, create tenant record
            if user.role == "TENANT":
                tenant = Tenant(userId=user.id)
                db.add(tenant)
                db.commit()
        
        # Create access token
        access_token = create_access_token(data={"sub": user.email})
        
        # Prepare user response
        user_basic = UserBasic.model_validate(user)
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user_basic
        )
        
    except ValueError as e:
        print(f"❌ Google auth ValueError: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        print(f"❌ Google auth Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google authentication failed: {str(e)}"
        )
