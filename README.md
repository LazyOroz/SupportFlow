# SupportFlow



SupportFlow is a backend support ticket management system built with ASP.NET Core, MySQL, Entity Framework Core, and Clean Architecture.



The project provides authentication, role-based authorization, ticket management, agent assignment, and a foundation for future AI-powered support features.



## Features



### Authentication



- User registration

- User login

- JWT authentication

- Password hashing with BCrypt

- Authenticated user profile endpoint

- Active/inactive user support



### Role-Based Authorization



SupportFlow currently supports three roles:



- **Customer** — creates and views their own tickets

- **Agent** — handles support tickets and updates ticket statuses

- **Admin** — manages ticket assignment and administrative operations



Authorization is enforced using JWT claims and ASP.NET Core role-based authorization.



### Ticket Management



Tickets contain:



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



Current ticket statuses:



- `Open`

- `InProgress`

- `Resolved`

- `Closed`



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



The backend validates that the selected user exists, is active, and has the correct role before assigning the ticket.



## Tech Stack



### Backend



- C#

- .NET 10

- ASP.NET Core Web API

- Entity Framework Core

- MySQL 8



### Authentication \& Security



- JWT Bearer Authentication

- BCrypt password hashing

- Role-based authorization

- .NET User Secrets for local secrets



### Development



- Git

- GitHub

- PowerShell

- Visual Studio

- EF Core Migrations



### Testing



- xUnit project structure



## Architecture



SupportFlow follows a layered Clean Architecture structure:



```text

SupportFlow

│

├── backend

│   ├── SupportFlow.Api

│   │   ├── Controllers

│   │   └── Program.cs

│   │

│   ├── SupportFlow.Application

│   │   ├── Auth

│   │   │   ├── DTOs

│   │   │   └── Interfaces

│   │   └── Tickets

│   │       ├── DTOs

│   │       └── Interfaces

│   │

│   ├── SupportFlow.Domain

│   │   ├── Entities

│   │   └── Enums

│   │

│   ├── SupportFlow.Infrastructure

│   │   ├── Authentication

│   │   ├── Persistence

│   │   └── Services

│   │

│   └── SupportFlow.Tests

│

└── SupportFlow.slnx

```



### Dependency Flow



```text

API

&#x20;│

&#x20;├── Application

&#x20;│       │

&#x20;│       └── Domain

&#x20;│

&#x20;└── Infrastructure

&#x20;        │

&#x20;        ├── Application

&#x20;        └── Domain

```



The Domain layer contains the core entities and enums.



The Application layer defines DTOs and service contracts.



The Infrastructure layer implements persistence, authentication, and application services.



The API layer exposes the system through REST endpoints.



## Domain Model



The current domain contains three main entities:



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



The model also supports internal comments through the `IsInternal` property.



## API



Base development URL:



```text

http://localhost:5263

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

GET   /api/tickets/{id}

PATCH /api/tickets/{id}/status

PATCH /api/tickets/{ticketId}/assign/{agentId}

```



### Authorization



| Endpoint | Customer | Agent | Admin |

|---|:---:|:---:|:---:|

| Register / Login | Yes | Yes | Yes |

| Get current user | Yes | Yes | Yes |

| Create ticket | Yes | Yes | Yes |

| View own tickets | Yes | Yes | Yes |

| Update ticket status | No | Yes | Yes |

| Assign ticket to agent | No | No | Yes |



## Database



SupportFlow uses MySQL with Entity Framework Core.



Main tables:



```text

users

tickets

comments

```



Database schema changes are managed through EF Core migrations.



Create/update the database with:



```powershell

dotnet ef database update `

&#x20;   --project backend/SupportFlow.Infrastructure `

&#x20;   --startup-project backend/SupportFlow.Api

```



## Getting Started



### Requirements



Install:



- .NET 10 SDK

- MySQL 8

- Git

- EF Core CLI tools



Clone the repository:



```bash

git clone https://github.com/LazyOroz/SupportFlow.git

cd SupportFlow

```



Restore dependencies:



```powershell

dotnet restore SupportFlow.slnx

```



Create a MySQL database:



```sql

CREATE DATABASE supportflow\_db

CHARACTER SET utf8mb4

COLLATE utf8mb4\_unicode\_ci;

```



### Local Configuration



Sensitive configuration is not stored in the repository.



Initialize .NET User Secrets:



```powershell

dotnet user-secrets init --project backend/SupportFlow.Api

```



Configure the database connection:



```powershell

dotnet user-secrets set `

&#x20;   "ConnectionStrings:DefaultConnection" `

&#x20;   "Server=localhost;Port=3306;Database=supportflow\_db;User=YOUR\_USER;Password=YOUR\_PASSWORD;" `

&#x20;   --project backend/SupportFlow.Api

```



Configure a JWT signing key:



```powershell

dotnet user-secrets set `

&#x20;   "Jwt:Key" `

&#x20;   "YOUR\_DEVELOPMENT\_JWT\_SECRET" `

&#x20;   --project backend/SupportFlow.Api

```



Never commit real passwords or production secrets to Git.



### Apply Migrations



```powershell

dotnet ef database update `

&#x20;   --project backend/SupportFlow.Infrastructure `

&#x20;   --startup-project backend/SupportFlow.Api

```



### Build



```powershell

dotnet build SupportFlow.slnx

```



### Run



```powershell

dotnet run --project backend/SupportFlow.Api

```



## Example Ticket



Example request:



```json

{

&#x20; "title": "Cannot log in to my account",

&#x20; "description": "I cannot access my account after changing my password.",

&#x20; "priority": "High",

&#x20; "category": "Account"

}

```



Example response:



```json

{

&#x20; "ticketNumber": "SF-20260925-XXXXXX",

&#x20; "title": "Cannot log in to my account",

&#x20; "status": "Open",

&#x20; "priority": "High",

&#x20; "category": "Account"

}

```



## Roadmap



SupportFlow is under active development.



Planned features include:



- Assigned tickets queue for agents

- Ticket comments

- Internal agent notes

- Ticket search and filtering

- Pagination and sorting

- Status transition rules

- Improved validation

- Global exception handling

- Refresh tokens

- Admin user management

- Automated tests

- Docker support

- GitHub Actions CI/CD

- React frontend



### AI Support Features



The long-term goal is to add AI-assisted support functionality such as:



- Automatic ticket categorization

- Automatic priority detection

- Ticket summarization

- Sentiment analysis

- Suggested agent responses



These features are planned and are not yet part of the current implementation.



## Project Goals



SupportFlow is being developed as a portfolio project focused on practical backend engineering concepts:



- REST API design

- Authentication

- Authorization

- Relational databases

- Entity Framework Core

- Clean Architecture

- Security

- Testing

- Maintainable application structure

- AI integration



## Author



**Orozobek Israilov**



Junior Software Developer



GitHub: LazyOroz


