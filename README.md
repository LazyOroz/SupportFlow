# SupportFlow

SupportFlow is a backend support ticket management system built with ASP.NET Core, MySQL, Entity Framework Core, Docker, and Clean Architecture.

The project provides JWT authentication, role-based authorization, ticket management, agent assignment, comments and internal notes, filtering, pagination, automated tests, Docker support, and CI.

The long-term goal is to extend SupportFlow with a React frontend and AI-assisted customer support features.

---

## Features

### Authentication

- User registration
- User login
- JWT authentication
- BCrypt password hashing
- Authenticated user profile endpoint
- Active/inactive user support

### Role-Based Authorization

SupportFlow supports three roles:

- **Customer** - creates and manages their support requests
- **Agent** - handles tickets assigned to them
- **Admin** - manages tickets and agent assignments

Authorization is enforced using JWT claims and ASP.NET Core role-based authorization.

### Ticket Management

Each ticket contains:

- Unique ticket number
- Title
- Description
- Status
- Priority
- Category
- Creator
- Assigned agent
- Creation timestamp
- Update timestamp
- Resolution timestamp

Ticket statuses:

- `Open`
- `InProgress`
- `Resolved`
- `Closed`

Supported workflow:

```text
Open -> InProgress -> Resolved -> Closed
```

Invalid status transitions are rejected by the backend.

Priorities:

- `Low`
- `Medium`
- `High`
- `Critical`

Categories:

- `General`
- `Technical`
- `Billing`
- `Account`
- `FeatureRequest`
- `Bug`
- `Other`

### Ticket Assignment

Admins can assign tickets to active users with the `Agent` role.

The backend validates that the selected user exists, is active, and has the correct role.

### Comments and Internal Notes

Tickets support conversations between users and support staff.

- Customers can create and view public comments on their own tickets.
- Assigned agents can create public comments and internal notes.
- Admins can access ticket comments.
- Internal notes are hidden from customers.
- Agents can access only tickets assigned to them.

### Search, Filtering and Pagination

Administrative ticket queries support:

- Text search
- Status filtering
- Priority filtering
- Category filtering
- Assigned agent filtering
- Pagination

Page size is limited by the backend to prevent excessively large queries.

### Error Handling

SupportFlow uses global exception middleware to provide consistent API error responses.

Handled cases include:

- `400 Bad Request`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

---

## Tech Stack

### Backend

- C#
- .NET 10
- ASP.NET Core Web API
- Entity Framework Core
- MySQL 8

### Authentication & Security

- JWT Bearer Authentication
- BCrypt password hashing
- Role-based authorization
- .NET User Secrets for local development
- Environment variables for Docker secrets

### Testing

- xUnit
- EF Core InMemory provider
- 19 automated tests

Current automated tests cover:

- Authentication
- Registration
- Password hashing
- Login validation
- Disabled accounts
- Ticket status transitions
- Agent authorization
- Admin ticket operations
- Public comments
- Internal notes
- Comment visibility

### DevOps

- Docker
- Docker Compose
- GitHub Actions
- Automated build and test workflow
- EF Core automatic migrations

---

## Architecture

SupportFlow follows a layered Clean Architecture structure:

```text
SupportFlow
|
+-- backend
|   |
|   +-- SupportFlow.Api
|   |   +-- Controllers
|   |   +-- Middleware
|   |   +-- Program.cs
|   |
|   +-- SupportFlow.Application
|   |   +-- Auth
|   |   +-- Tickets
|   |   +-- Comments
|   |   +-- DTOs
|   |   +-- Interfaces
|   |
|   +-- SupportFlow.Domain
|   |   +-- Entities
|   |   +-- Enums
|   |
|   +-- SupportFlow.Infrastructure
|   |   +-- Authentication
|   |   +-- Persistence
|   |   +-- Services
|   |
|   +-- SupportFlow.Tests
|
+-- Dockerfile
+-- compose.yaml
+-- SupportFlow.slnx
```

### Dependency Flow

```text
API
 |
 +--> Application
 |       |
 |       +--> Domain
 |
 +--> Infrastructure
         |
         +--> Application
         +--> Domain
```

The **Domain** layer contains core entities and enums.

The **Application** layer contains DTOs and service contracts.

The **Infrastructure** layer implements persistence, authentication, and application services.

The **API** layer exposes the application through REST endpoints and acts as the composition root.

---

## Domain Model

### User

Represents a SupportFlow user.

A user can:

- Create tickets
- Be assigned tickets as an agent
- Write comments
- Have a `Customer`, `Agent`, or `Admin` role

### Ticket

Represents a customer support request.

Each ticket belongs to its creator and can optionally be assigned to an agent.

### Comment

Represents communication related to a ticket.

Comments can be public or internal using the `IsInternal` property.

---

## API

### Docker Development URL

```text
http://localhost:8080
```

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
GET   /api/tickets/assigned-to-me
GET   /api/tickets/all
GET   /api/tickets/{id}

PATCH /api/tickets/{id}/status
PATCH /api/tickets/{ticketId}/assign/{agentId}
```

### Comments

```http
POST /api/tickets/{ticketId}/comments
GET  /api/tickets/{ticketId}/comments
```

### OpenAPI

When running in the Development environment:

```text
http://localhost:8080/openapi/v1.json
```

---

## Database

SupportFlow uses MySQL 8 with Entity Framework Core.

Main tables:

```text
Users
Tickets
Comments
__EFMigrationsHistory
```

Database schema changes are managed using EF Core migrations.

When SupportFlow starts, pending migrations are automatically applied:

```csharp
dbContext.Database.Migrate();
```

---

# Running with Docker

Docker is the easiest way to run SupportFlow.

## Requirements

Install:

- Git
- Docker Desktop

Clone the repository:

```bash
git clone https://github.com/LazyOroz/SupportFlow.git
cd SupportFlow
```

Create a `.env` file in the project root:

```env
MYSQL_ROOT_PASSWORD=YOUR_ROOT_PASSWORD
MYSQL_PASSWORD=YOUR_DATABASE_PASSWORD
JWT_KEY=YOUR_LONG_RANDOM_JWT_SECRET
```

Do not commit the `.env` file.

Start the application:

```bash
docker compose up --build
```

Docker Compose starts:

```text
supportflow-api
        |
        | EF Core
        v
supportflow-mysql
        |
        v
supportflow_db
```

The API becomes available at:

```text
http://localhost:8080
```

MySQL is exposed to the host on:

```text
localhost:3307
```

Inside the Docker network, the API connects to MySQL using port `3306`.

### Stop the application

```bash
docker compose down
```

Database data is stored in a Docker volume and survives normal container restarts.

---

# Running without Docker

## Requirements

Install:

- .NET 10 SDK
- MySQL 8
- Git
- EF Core CLI tools

Restore dependencies:

```bash
dotnet restore SupportFlow.slnx
```

Configure sensitive values using .NET User Secrets.

Example database connection:

```powershell
dotnet user-secrets set `
    "ConnectionStrings:DefaultConnection" `
    "Server=localhost;Port=3306;Database=supportflow_db;User=YOUR_USER;Password=YOUR_PASSWORD;" `
    --project backend/SupportFlow.Api
```

Configure the JWT signing key:

```powershell
dotnet user-secrets set `
    "Jwt:Key" `
    "YOUR_DEVELOPMENT_JWT_SECRET" `
    --project backend/SupportFlow.Api
```

Build:

```bash
dotnet build SupportFlow.slnx
```

Run:

```bash
dotnet run --project backend/SupportFlow.Api
```

---

## Testing

Run all automated tests:

```bash
dotnet test SupportFlow.slnx
```

Current test suite:

```text
Total:   19
Passed:  19
Failed:  0
```

Tests cover authentication, ticket workflows, permissions, comments, and internal notes.

---

## Continuous Integration

SupportFlow uses GitHub Actions.

On every push or pull request to `main`, CI automatically:

```text
Checkout repository
        |
        v
Setup .NET 10
        |
        v
Restore dependencies
        |
        v
Build Release
        |
        v
Run automated tests
```

This verifies that the application builds successfully and that all automated tests pass.

---

## Example Ticket

Request:

```json
{
  "title": "Cannot log in to my account",
  "description": "I cannot access my account after changing my password.",
  "priority": "High",
  "category": "Account"
}
```

Example response:

```json
{
  "ticketNumber": "SF-20260925-XXXXXX",
  "title": "Cannot log in to my account",
  "status": "Open",
  "priority": "High",
  "category": "Account"
}
```

---

## Roadmap

### Completed

- [x] Clean Architecture backend
- [x] MySQL database
- [x] EF Core migrations
- [x] JWT authentication
- [x] BCrypt password hashing
- [x] Role-based authorization
- [x] Ticket creation and management
- [x] Agent ticket assignment
- [x] Assigned ticket queue
- [x] Ticket comments
- [x] Internal agent notes
- [x] Ticket search and filtering
- [x] Pagination
- [x] Status transition rules
- [x] Request validation
- [x] Global exception handling
- [x] Automated tests
- [x] GitHub Actions CI
- [x] Docker support
- [x] Docker Compose with MySQL
- [x] Automatic database migrations

### Planned

- [ ] Refresh tokens
- [ ] Admin user management
- [ ] Integration tests
- [ ] React frontend
- [ ] AI-assisted support features

---

## Planned AI Features

Future AI functionality may include:

- Automatic ticket categorization
- Automatic priority detection
- Ticket summarization
- Sentiment analysis
- Suggested agent responses

These features are planned and are not part of the current implementation.

---

## Project Goals

SupportFlow is a portfolio project focused on practical backend engineering concepts:

- REST API design
- Authentication and authorization
- Relational database design
- Entity Framework Core
- Clean Architecture
- Security
- Automated testing
- Docker
- CI
- Maintainable application structure
- Future AI integration

---

## Author

**Orozobek Israilov**

Junior Software Developer

GitHub: **LazyOroz**