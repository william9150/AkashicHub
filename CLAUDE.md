# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AkashicHub (阿卡西) is an IT internal resource retrieval system designed for centralized management of technical resources (servers, databases, websites) with relationship mapping and secure access control. The system uses a modern frontend-backend separation architecture with Docker containerization.

## Development Commands

### Backend (akashichub-api)
- `npm install` - Install dependencies
- `npm run dev` - Start development server (port 3000)
- `npm test` - Run Jest tests with coverage
- `npm run init-db` - Initialize database and create default admin user

### Development Environment Setup
1. Start core services: `docker-compose up -d akashichub-db akashichub-seq`
2. Backend: `cd akashichub-api && npm install && npm run dev`
3. Frontend: `cd akashichub-ui && npm install && npm run dev`

### Full Docker Environment
- `docker-compose up -d` - Start all services (production-like environment)
- Access Seq logs at http://localhost:8081
- Database accessible at localhost:3307

## Architecture

### Backend Structure (Node.js ES Modules)
- **config/** - Database configuration and environment settings
- **controllers/** - HTTP request handlers (authController, resourceController, tagController, userController)
- **middlewares/** - JWT authentication and authorization middleware
- **models/** - Sequelize ORM models (User, Resource, Tag, ResourceTag, ResourceRelationship)
- **routes/** - API route definitions (auth, resources, tags, adminUsers)
- **services/** - Business logic layer
- **utils/** - Shared utilities (crypto, logger with Winston + Seq integration)
- **tests/** - Jest unit tests
- **scripts/** - Database initialization scripts

### Key Technologies
- **Backend**: Node.js v22 + Express + Sequelize + MySQL
- **Authentication**: JWT with bcrypt password hashing
- **Logging**: Winston with Seq structured logging
- **Testing**: Jest with ES modules support
- **Database**: MySQL 8.x with Docker

### Database Models
- **Users**: LoginAccount (unique), DisplayName, PasswordHash, Role (Admin/User)
- **Resources**: ResourceType, Name, IpAddress, LoginUser, encrypted passwords
- **Tags**: Name, Category for resource classification
- **ResourceTags**: Many-to-many relationship between resources and tags
- **ResourceRelationships**: Resource dependencies and connections

### API Structure
All APIs use `/api` prefix with standardized response format:
```json
{
  "success": true|false,
  "data": {...},
  "error": { "code": "ERROR_CODE", "message": "..." }
}
```

Main endpoints:
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Current user info
- `/api/resources/*` - Resource CRUD operations
- `/api/tags/*` - Tag management
- `/api/admin/users/*` - User management (Admin only)

### Authentication & Authorization
- JWT tokens with configurable expiration (default 7d)
- Two roles: Admin (full access) and User (read-only resources)
- Middleware: `authenticateToken()` and `authorizeAdmin()`

### Environment Configuration
The project uses `.env` files for configuration. Key variables:
- Database connection (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
- JWT settings (JWT_SECRET, JWT_EXPIRES_IN)
- Encryption key for sensitive data (ENCRYPTION_KEY)
- Seq logging (SEQ_URL)
- Default admin credentials (DEFAULT_ADMIN_ACCOUNT, DEFAULT_ADMIN_PASSWORD)

### Testing
- Jest configured for ES modules with `NODE_OPTIONS=--experimental-vm-modules`
- Unit tests for controllers, services, and middleware
- Test files in `tests/` directory
- Coverage reporting enabled

### Development Notes
- ES modules used throughout (import/export syntax)
- Database auto-sync on startup with default admin user creation
- Structured logging to Seq for monitoring and debugging
- Password encryption for sensitive resource credentials
- Comprehensive error handling with standardized error codes