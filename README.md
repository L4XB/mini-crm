# Mini CRM System

A comprehensive Customer Relationship Management (CRM) system with a Go-based backend API and React frontend. This system is designed to manage customer relationships, deals, tasks, and notes in a modern, responsive interface.

![Mini CRM](assets/banner.png)

## Overview

This repository contains the backend and frontend components of the Mini CRM system:

- **Backend**: A robust API built with Go, Gin, and GORM
- **Frontend**: A responsive web application built with React and TypeScript (currently in development)

## Technology Stack

### Backend
- **Language**: Go
- **Web Framework**: Gin
- **ORM**: GORM
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Validation**: go-playground/validator
- **Logging**: logrus
- **Security**: Rate Limiting, Request-Size-Limiting, CORS

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (admin/user)
  - Refresh token mechanism
  - Mobile-specific authentication
  
- **Comprehensive Data Management**
  - CRUD operations for all entities
  - Contacts, deals, tasks, and notes management
  - User settings and preferences
  
- **Security**
  - API key validation for external applications
  - Rate limiting and protection against brute-force attacks
  - Request size limiting
  - CORS configuration
  - Data integrity policies
  
- **Developer Experience**
  - Structured logging with request tracking
  - Prometheus metrics for monitoring (admin only)
  - Health check endpoints for container orchestration
  - Comprehensive Swagger documentation with interactive API testing
  - Test mode for UI development
  - Standardized API responses

## Data Models

1. **User**
   - Attributes: Username, Email, Password, Role
   - Relationships: Settings, Contacts, Deals, Notes, Tasks

2. **Contact**
   - Attributes: First Name, Last Name, Email, Phone
   - Relationships: User, Notes, Deals

3. **Deal**
   - Attributes: Title, Description, Value, Status
   - Relationships: Contact, User, Tasks

4. **Note**
   - Attributes: Content
   - Relationships: Contact, Deal, User

5. **Task**
   - Attributes: Title, Details, Due Date, Completed Status
   - Relationships: Deal, User

6. **Settings**
   - Attributes: Theme, Language
   - Relationship: User

## Getting Started

### Prerequisites

- Go 1.17 or higher
- PostgreSQL 12 or higher
- Node.js 16 or higher (for frontend development)
- npm or yarn (for frontend development)

### Installation

#### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mini-crm.git
cd mini-crm
```

2. Set up environment variables:
   Create a `.env` file in the backend directory with the following variables:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=mini_crm
JWT_SECRET_KEY=your-secret-key
JWT_EXPIRATION_HOURS=24
PORT=8081
ENV=development
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=info
```

3. Install backend dependencies:
```bash
cd backend
go mod download
```

4. Start the backend server:
```bash
go run cmd/main.go
# or using make:
make run
```

#### Frontend Setup

The frontend is currently in development. To run it locally:

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

The frontend will be available at `http://localhost:3001`.

## API Documentation

### Base URL

By default, the server runs at:
```
http://localhost:8081/api/v1
```

### Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

To obtain a token, send a POST request to `/api/v1/auth/login` with valid credentials.

### Key Endpoints

- **Authentication**:
  - POST `/api/v1/auth/register` - Register new user
  - POST `/api/v1/auth/login` - Login
  - GET `/api/v1/auth/me` - Get current user
  - POST `/api/v1/auth/refresh` - Refresh token

- **Users** (some endpoints admin-only):
  - GET `/api/v1/users` - Get all users
  - GET `/api/v1/users/:id` - Get user by ID
  - POST `/api/v1/users` - Create user (admin)
  - PUT `/api/v1/users/:id` - Update user
  - DELETE `/api/v1/users/:id` - Delete user (admin)

- **Contacts**:
  - GET `/api/v1/contacts` - Get contacts
  - GET `/api/v1/contacts/:id` - Get contact by ID
  - POST `/api/v1/contacts` - Create contact
  - PUT `/api/v1/contacts/:id` - Update contact
  - DELETE `/api/v1/contacts/:id` - Delete contact

Similar endpoints exist for **Deals**, **Notes**, **Tasks**, and **Settings**.

### Complete Documentation

The complete API documentation is available as a Postman collection. Import the file `mini_crm_api_complete.json` into Postman to see all endpoints with examples.

Additionally, the API is documented with Swagger UI, which is available at `/swagger/index.html` when running the server in development mode.

## Security Features

The Mini CRM system implements several security measures:

### 1. JWT Authentication
- Secure token-based authentication
- Configurable token lifetime
- Encrypted user passwords with bcrypt

### 2. Role-based Authorization
- Different permissions for admin and regular users
- Resource ownership verification for all operations

### 3. Rate Limiting
- Protection against brute-force attacks
- Stricter limits for authentication endpoints
- IP-based limiting

### 4. Request Size Limiting
- Protection against denial-of-service via large payloads
- Configurable size restriction (default: 10MB)

### 5. CORS Configuration
- Restriction to allowed origins
- Protection against cross-site requests

### 6. Comprehensive Logging
- Structured logs for all requests and system events
- Request tracking with unique request IDs
- Different log levels for different environments

### 7. Data Security
- Validation of all inputs
- Prevention of resource ownership changes
- Protection against unauthorized data access

## Development Features

### Logging

The system uses structured logging with different log levels:

- **debug**: Detailed development information
- **info**: General application information
- **warn**: Warnings and potentially problematic situations
- **error**: Errors affecting application functionality

The log level can be configured via the `LOG_LEVEL` environment variable.

### Swagger Documentation

The Mini CRM has comprehensive Swagger documentation that greatly facilitates frontend development and integration:

#### Accessing Swagger Documentation

1. Start the server in development mode with one of the following commands:
   ```bash
   make run
   # or with hot-reload:
   make run-dev
   ```

2. Open the Swagger UI in your browser at:
   ```
   http://localhost:8081/swagger/index.html
   ```

3. In the Swagger UI, you can:
   - View all available API endpoints
   - Examine request/response models and parameters in detail
   - Test APIs directly in the browser
   - Use API tokens for authenticated requests
   - Download the documentation as JSON or YAML

#### Notes on Swagger Usage

- In the production environment, Swagger is disabled by default
- With the environment variable `ENABLE_SWAGGER=true`, Swagger can also be enabled in production
- The definition can be viewed in `/docs/swagger.json` or `/docs/swagger.yaml`

## UI Development Mode

For parallel development of frontend and backend, the system offers a special test mode:

### Activating Test Mode

1. Ensure that the `.env.development` file is being used in the backend directory

2. Test mode configuration:
   ```
   # Enable UI test mode
   UI_TEST_MODE=true
   
   # Predefined test user
   UI_TEST_USER=admin@example.com
   UI_TEST_PASSWORD=test1234
   
   # Optional: Bypass authentication (ONLY for development!)
   DISABLE_AUTH_FOR_TESTS=false
   
   # Generate test data
   SEED_TEST_DATA=true
   ```

3. Start the backend in development mode:
   ```bash
   make run-dev
   ```

### Test Mode Features

- **Automated Authentication**: With `DISABLE_AUTH_FOR_TESTS` enabled, all requests are automatically authenticated
- **Test Header**: In test mode, an `X-Test-Mode: enabled` header is returned
- **Extended CORS**: All local development servers are automatically added to the CORS list
- **Test Data**: With `SEED_TEST_DATA` enabled, sample data is automatically generated

> **IMPORTANT**: Test mode should never be activated in production environments!

## Project Structure

### Backend Structure

- `/cmd`: Application entry point
- `/config`: Database and application configuration
- `/controllers`: API controllers for all models
- `/middleware`: Middleware components
- `/models`: Data models and DB schema
- `/routes`: API routes and endpoints
- `/utils`: Helper functions and shared utilities

### Extending the Backend

1. Add new models in `/models`
2. Create corresponding controllers in `/controllers`
3. Register new routes in `/routes/router.go`
4. Add new migrations in the `migrate()` function

## Deployment

For information on deploying the Mini CRM system to production environments, please refer to the [Deployment Guide](backend/DEPLOYMENT_GUIDE.md).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License with an attribution clause - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Gin Web Framework](https://github.com/gin-gonic/gin)
- [GORM](https://gorm.io/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Query](https://react-query.tanstack.com/)
- [Formik](https://formik.org/)
- [Framer Motion](https://www.framer.com/motion/)
