# ⚠️ DEPRECATED - OLD BACKEND

## This Backend is No Longer Active

This Node.js/Express backend has been **replaced** by the Python FastAPI backend located in `/backend-python/`.

### Current Active Backend
**Location:** `/backend-python/`  
**Technology:** Python 3.11 + FastAPI + SQLAlchemy  
**Container:** `pm-backend-python`  
**Port:** 5000

### This Folder (Old Backend)
**Location:** `/backend/`  
**Technology:** Node.js + Express + Prisma  
**Status:** ❌ Deprecated - Code commented out  
**Purpose:** Reference only

## Files Status

All main executable files have been commented out:
- ❌ `server.js` - Entry point (commented out)
- ❌ `app.js` - Express app (commented out)
- ℹ️ `src/` - Source code (kept for reference)
- ℹ️ `prisma/` - Database schema (kept for reference)
- ℹ️ `.env` - Environment variables (kept for reference)

## What to Keep

These files are useful for reference:
- `prisma/schema.prisma` - Original database schema
- `src/` folder - Original implementation logic
- `.env` - Configuration reference
- `package.json` - Dependencies list

## What Can Be Deleted

These can be safely removed to save space:
- `node_modules/` - 200+ MB of dependencies
- `coverage/` - Old test coverage reports
- `tests/` - Old JavaScript tests (replaced by pytest)
- `Dockerfile` - Old Docker config (not used)

## Migration Complete ✅

All features have been migrated to Python FastAPI:
- ✅ Authentication (JWT + bcrypt)
- ✅ Properties, Units, Leases CRUD
- ✅ Payment processing (Stripe)
- ✅ Maintenance requests
- ✅ Tenant management
- ✅ Dashboard statistics
- ✅ Tenant portal

---

**Last Active:** November 2025  
**Replaced By:** `/backend-python/` (December 2025)
