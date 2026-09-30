# 🎫 SupportFlow

### Full-Stack Helpdesk & Ticket Management System

SupportFlow is a full-stack helpdesk application for managing customer support tickets.

The system provides separate workflows for **Customers, Support Agents, and Administrators**, including ticket creation, assignment, status management, comments, internal notes, authentication, and role-based authorization.

This project was built as a portfolio project to demonstrate full-stack development using **ASP.NET Core, React, MySQL, Entity Framework Core, JWT authentication, Docker, and automated testing**.

---

## ✨ Features

### 👤 Customer

- Register and log in
- Create support tickets
- Select ticket category and priority
- View personal tickets
- Track ticket status
- Open ticket details
- Communicate with support agents
- View public replies
- Protected customer routes

### 🎧 Support Agent

- Dedicated Agent Dashboard
- View assigned tickets
- Track Open, In Progress, and Resolved tickets
- Open assigned ticket details
- Change ticket status
- Move tickets through the support workflow
- Reply to customers
- Add private internal notes
- Internal notes are hidden from customers

### 🛡️ Administrator

- Dedicated Admin Dashboard
- View all support tickets
- Search and filter tickets
- View registered support agents
- Assign tickets to agents
- Reassign tickets
- Monitor ticket statistics
- Access administrative pages
- Role-protected admin routes

---

## 🔄 Ticket Workflow

Tickets follow a controlled status workflow:

```text
Open
  ↓
InProgress
  ↓
Resolved
  ↓
Closed
```

The backend validates status transitions to prevent invalid workflow changes.

---

## 🎯 Ticket Priorities

SupportFlow supports four ticket priority levels:

```text
Low
Medium
High
Critical
```

---

## 📂 Ticket Categories

Available ticket categories:

```text
General
Technical
Billing
Account
FeatureRequest
Bug
Other
```

---

## 🔐 Authentication & Authorization

SupportFlow uses **JWT Bearer Authentication**.

After successful authentication, the API generates a JWT containing user information and role claims.

Supported roles:

```text
Customer
Agent
Admin
```

Authorization is enforced by the ASP.NET Core backend.

The React frontend also uses protected routes to prevent users from accessing pages intended for other roles.

Examples:

```text
Customer → Customer Dashboard
Agent    → Agent Dashboard
Admin    → Admin Dashboard
```

---

## 💬 Comments & Internal Notes

Ticket conversations support two types of messages.

### Public Reply

Visible to the customer and authorized support staff.

### Internal Note

Visible only to support staff.

This allows agents and administrators to communicate internally without exposing private support notes to customers.

---

## 🧱 Architecture

The backend follows a Clean Architecture inspired structure:

```text
SupportFlow
│
├── backend
│   ├── SupportFlow.Api
│   ├── SupportFlow.Application
│   ├── SupportFlow.Domain
│   ├── SupportFlow.Infrastructure
│   └── SupportFlow.Tests
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   └── services
│   │
│   └── public
│
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### SupportFlow.Domain

Contains core domain models and enums.

Examples:

- User
- Ticket
- Comment
- UserRole
- TicketStatus
- TicketPriority
- TicketCategory

### SupportFlow.Application

Contains application contracts, DTOs, validation models, and service abstractions.

### SupportFlow.Infrastructure

Contains infrastructure implementations such as:

- Entity Framework Core
- MySQL persistence
- Authentication services
- Ticket services
- Comment services
- JWT token generation

### SupportFlow.Api

ASP.NET Core Web API responsible for:

- Controllers
- Authentication
- Authorization
- Dependency injection
- CORS
- Middleware
- API configuration

### SupportFlow.Tests

Contains automated tests for important application behavior.

---

## 🛠️ Technology Stack

### Backend

- C#
- .NET 10
- ASP.NET Core Web API
- Entity Framework Core
- MySQL 8
- JWT Bearer Authentication
- BCrypt
- Swagger / OpenAPI

### Frontend

- React
- JavaScript
- Vite
- React Router
- CSS

### DevOps & Tools

- Docker
- Docker Compose
- Git
- GitHub
- GitHub Actions
- xUnit
- Visual Studio

---

## 🗄️ Database

SupportFlow uses **MySQL 8**.

Main database tables:

```text
Users
Tickets
Comments
__EFMigrationsHistory
```

Entity Framework Core migrations are used to manage the database schema.

When the API starts, pending migrations are automatically applied.

---

## 🐳 Docker

The backend and MySQL database can run using Docker Compose.

Start the containers:

```bash
docker compose up --build -d
```

Check container status:

```bash
docker compose ps
```

The API is available at:

```text
http://localhost:8080
```

MySQL is exposed locally on:

```text
localhost:3307
```

Stop the containers:

```bash
docker compose down
```

---

## 💻 Frontend

Open the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

Create a production build:

```bash
npm run build
```

---

## 🧪 Tests

The project includes automated xUnit tests for backend functionality.

Run the tests from the project root:

```bash
dotnet test
```

Current test suite:

```text
Total: 19
Passed: 19
Failed: 0
```

---

## 🔌 Main API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Tickets

```http
POST  /api/tickets
GET   /api/tickets
GET   /api/tickets/{id}
PATCH /api/tickets/{id}/status
```

### Agent

```http
GET /api/tickets/assigned-to-me
```

### Admin

```http
GET   /api/tickets/all
PATCH /api/tickets/{ticketId}/assign/{agentId}
GET   /api/users/agents
```

### Comments

```http
GET  /api/tickets/{ticketId}/comments
POST /api/tickets/{ticketId}/comments
```

---

## ⚠️ Configuration

Sensitive values are not stored in the repository.

The application requires configuration for values such as:

```text
Database connection string
JWT secret key
```

For local development, secrets should be configured using environment variables, .NET User Secrets, or a local `.env` file where appropriate.

Never commit production secrets to Git.

---

## 🚀 CI

The repository includes a **GitHub Actions** workflow.

The CI pipeline automatically performs backend checks such as:

```text
Restore dependencies
Build project
Run tests
```

This helps detect build or test failures when changes are pushed to the repository.

---

## 🖥️ Application Pages

The React frontend includes:

```text
Login
Registration
Customer Dashboard
Create Ticket
My Tickets
Ticket Details
Agent Dashboard
Admin Dashboard
All Tickets
Agents
```

The interface changes depending on the authenticated user's role.

---

## 🔒 Security

The project implements several security mechanisms:

- Password hashing with BCrypt
- JWT authentication
- Backend role-based authorization
- Frontend protected routes
- User-specific ticket access
- Agent assignment checks
- Internal note visibility rules
- Secrets excluded from Git

The backend remains the authoritative security layer. Frontend route protection is used as an additional user-interface safeguard.

---

## 🗺️ Future Improvements

Possible future improvements include:

- AI-assisted ticket classification
- Automatic priority suggestions
- AI-generated ticket summaries
- Suggested support responses
- Email notifications
- File attachments
- Advanced analytics
- Refresh tokens
- Deployment to a cloud environment

---

## 📌 Project Status

**SupportFlow v1.0 — Completed**

Current version includes:

- Full backend API
- React frontend
- Customer workflow
- Agent workflow
- Administrator workflow
- JWT authentication
- Role-based authorization
- Ticket assignment
- Ticket status workflow
- Public comments
- Internal notes
- MySQL database
- Docker support
- Automated tests
- GitHub Actions CI

---

## 👨‍💻 Author

**Orozobek Israilov**

Junior Software Developer

GitHub: **LazyOroz**

---

## 📄 Purpose

SupportFlow was created as a portfolio project to practice and demonstrate full-stack software development, backend architecture, REST API design, database integration, authentication, authorization, testing, Docker, and frontend development.