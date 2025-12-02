# Property Management System

A full-stack property management application for landlords and tenants, built with React, FastAPI, and PostgreSQL.

## 🎉 Test Status

✅ **All 54 tests passing** (100% pass rate)
- Authentication & Authorization: 14/14 ✅
- Dashboard & Statistics: 8/8 ✅
- Properties Management: 10/10 ✅
- Leases Management: 8/8 ✅
- Payments Management: 7/7 ✅
- Tenants Management: 7/7 ✅

## 🚀 Quick Start with Docker

### Prerequisites
- [Docker](https://www.docker.com/get-started) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

### Build and Run

1. **Clone the repository**
```bash
git clone https://github.com/MabishanGopalakrishnan/property-management-final.git
cd property-management-final
```

2. **Build and start all containers**
```bash
docker-compose up -d --build
```

This command will:
- Build the backend Python/FastAPI container
- Build the frontend React/Vite container
- Start the PostgreSQL database container
- Set up all necessary networks and volumes

3. **Access the application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

### Stop the Application
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🧪 Running Tests

Run the complete test suite:
```bash
docker exec pm-backend-python pytest -v
```

Run tests with coverage:
```bash
docker exec pm-backend-python pytest -v --cov=app --cov-report=term-missing
```

Run specific test file:
```bash
docker exec pm-backend-python pytest tests/test_auth.py -v
```

## 📁 Project Structure

```
property-management-final/
├── backend-python/          # FastAPI backend
│   ├── app/
│   │   ├── routers/        # API endpoints
│   │   ├── models.py       # Database models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── auth.py         # Authentication
│   │   └── database.py     # Database connection
│   ├── tests/              # Test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── api/           # API client functions
│   │   └── context/       # React context
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml     # Docker orchestration
```

## 🔑 Default Credentials

For testing purposes, you can register new accounts or use the following:

**Landlord Account:**
- Email: landlord@test.com
- Password: password123

**Tenant Account:**
- Email: tenant@test.com
- Password: password123

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation
- **JWT** - Authentication
- **pytest** - Testing framework

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 📝 Features

### Landlord Features
- Property management (CRUD)
- Unit management
- Tenant management
- Lease creation and tracking
- Payment tracking
- Maintenance request management
- Dashboard with statistics

### Tenant Features
- View lease details
- Payment history
- Submit maintenance requests
- Personal profile management

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (Landlord/Tenant)
- Password hashing with bcrypt
- Protected API endpoints
- CORS configuration

## 📊 API Documentation

Once the backend is running, access the interactive API documentation at:
- **Swagger UI**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
