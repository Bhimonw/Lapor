# LAPOR System Architecture

## Overview

LAPOR is a full-stack web application built with a modern architecture that separates concerns between frontend, backend, and database layers. The system follows RESTful API principles and implements secure authentication and authorization.

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend]
        B[Mobile Browser]
        C[Desktop Browser]
    end
    
    subgraph "API Gateway"
        D[Express.js Server]
        E[Authentication Middleware]
        F[Validation Middleware]
        G[File Upload Middleware]
    end
    
    subgraph "Business Logic"
        H[Auth Controller]
        I[Report Controller]
        J[User Controller]
        K[Admin Controller]
    end
    
    subgraph "Data Layer"
        L[MongoDB Database]
        M[File System Storage]
        N[Redis Cache]
    end
    
    subgraph "External Services"
        O[Geolocation API]
        P[Email Service]
        Q[Image Processing]
    end
    
    A --> D
    B --> D
    C --> D
    
    D --> E
    E --> F
    F --> G
    
    G --> H
    G --> I
    G --> J
    G --> K
    
    H --> L
    I --> L
    J --> L
    K --> L
    
    I --> M
    H --> N
    
    A --> O
    H --> P
    I --> Q
```

## Component Architecture

### Frontend Architecture

```mermaid
graph TB
    subgraph "React Application"
        A[App.jsx]
        B[Router]
        C[Auth Context]
        D[Toast Provider]
    end
    
    subgraph "Pages"
        E[Login Page]
        F[Register Page]
        G[Dashboard]
        H[Create Report]
        I[Admin Panel]
    end
    
    subgraph "Components"
        J[Header]
        K[Sidebar]
        L[Report Card]
        M[Map Component]
        N[File Upload]
    end
    
    subgraph "Hooks"
        O[useAuth]
        P[useGeolocation]
        Q[useReports]
    end
    
    subgraph "Services"
        R[API Service]
        S[Auth Service]
        T[Report Service]
    end
    
    A --> B
    A --> C
    A --> D
    
    B --> E
    B --> F
    B --> G
    B --> H
    B --> I
    
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    
    G --> L
    H --> M
    H --> N
    
    E --> O
    H --> P
    G --> Q
    
    O --> S
    P --> R
    Q --> T
```

### Backend Architecture

```mermaid
graph TB
    subgraph "Express Server"
        A[app.js]
        B[Routes]
        C[Middlewares]
        D[Error Handler]
    end
    
    subgraph "Routes"
        E[Auth Routes]
        F[Report Routes]
        G[User Routes]
        H[Admin Routes]
    end
    
    subgraph "Controllers"
        I[Auth Controller]
        J[Report Controller]
        K[User Controller]
        L[Admin Controller]
    end
    
    subgraph "Models"
        M[User Model]
        N[Report Model]
        O[Admin Model]
    end
    
    subgraph "Middlewares"
        P[Auth Middleware]
        Q[Admin Middleware]
        R[Validation Middleware]
        S[Upload Middleware]
        T[Rate Limit]
    end
    
    subgraph "Utils"
        U[JWT Utils]
        V[File Utils]
        W[Validation Utils]
        X[Email Utils]
    end
    
    A --> B
    A --> C
    A --> D
    
    B --> E
    B --> F
    B --> G
    B --> H
    
    E --> I
    F --> J
    G --> K
    H --> L
    
    I --> M
    J --> N
    K --> M
    L --> N
    
    C --> P
    C --> Q
    C --> R
    C --> S
    C --> T
    
    I --> U
    J --> V
    R --> W
    I --> X
```

## Data Flow Diagrams

### User Registration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    participant E as Email Service
    
    U->>F: Fill registration form
    F->>F: Validate input
    F->>B: POST /api/auth/register
    B->>B: Validate data
    B->>B: Hash password
    B->>D: Save user
    D-->>B: User created
    B->>B: Generate JWT
    B->>E: Send welcome email
    B-->>F: Return JWT + user data
    F->>F: Store JWT in localStorage
    F-->>U: Redirect to dashboard
```

### Report Creation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant G as Geolocation API
    participant B as Backend
    participant D as Database
    participant S as File Storage
    
    U->>F: Access create report page
    F->>G: Request current location
    G-->>F: Return coordinates
    F->>F: Display location on map
    U->>F: Fill form + upload photo
    F->>F: Validate form data
    F->>B: POST /api/reports (multipart)
    B->>B: Authenticate user
    B->>B: Validate data
    B->>S: Save uploaded photo
    S-->>B: Return file path
    B->>D: Save report data
    D-->>B: Report created
    B-->>F: Return success response
    F-->>U: Show success message
```

### Admin Report Management Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant B as Backend
    participant D as Database
    participant E as Email Service
    
    A->>F: Access admin panel
    F->>B: GET /api/reports (with filters)
    B->>B: Verify admin role
    B->>D: Query reports
    D-->>B: Return paginated reports
    B-->>F: Return report list
    F-->>A: Display reports table
    A->>F: Update report status
    F->>B: PUT /api/reports/:id
    B->>B: Verify admin role
    B->>D: Update report
    D-->>B: Report updated
    B->>E: Notify user of status change
    B-->>F: Return success
    F-->>A: Show update confirmation
```

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role
        boolean isActive
        Date createdAt
        Date updatedAt
    }
    
    REPORT {
        ObjectId _id PK
        ObjectId userId FK
        string description
        number latitude
        number longitude
        string address
        string photoPath
        string status
        string adminNotes
        Date createdAt
        Date updatedAt
    }
    
    ADMIN_LOG {
        ObjectId _id PK
        ObjectId adminId FK
        ObjectId reportId FK
        string action
        string details
        Date timestamp
    }
    
    USER ||--o{ REPORT : creates
    USER ||--o{ ADMIN_LOG : performs
    REPORT ||--o{ ADMIN_LOG : affects
```

### Collection Schemas

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  isActive: Boolean (default: true),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

#### Reports Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  description: String (required, 10-1000 chars),
  latitude: Number (required, -90 to 90),
  longitude: Number (required, -180 to 180),
  address: String (optional),
  photoPath: String (required),
  status: String (enum: ['pending', 'verified', 'rejected', 'in_progress', 'working', 'completed'], default: 'pending'),
  adminNotes: String (optional),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

## Security Architecture

### Authentication & Authorization Flow

```mermaid
graph TB
    subgraph "Client"
        A[Login Request]
        B[JWT Token]
        C[Protected Request]
    end
    
    subgraph "Server"
        D[Auth Controller]
        E[JWT Middleware]
        F[Role Middleware]
        G[Protected Route]
    end
    
    subgraph "Security Layers"
        H[Input Validation]
        I[Rate Limiting]
        J[CORS Policy]
        K[Helmet Security]
    end
    
    A --> D
    D --> B
    B --> C
    C --> E
    E --> F
    F --> G
    
    D --> H
    C --> I
    C --> J
    C --> K
```

### Security Measures

1. **Authentication**
   - JWT tokens with expiration
   - Refresh token mechanism
   - Password hashing with bcrypt

2. **Authorization**
   - Role-based access control (RBAC)
   - Route-level permissions
   - Resource-level permissions

3. **Input Security**
   - Express-validator for input validation
   - Data sanitization
   - File upload restrictions

4. **API Security**
   - Rate limiting
   - CORS configuration
   - Security headers with Helmet
   - Request size limits

## Deployment Architecture

### Production Deployment

```mermaid
graph TB
    subgraph "Load Balancer"
        A[Nginx/CloudFlare]
    end
    
    subgraph "Application Servers"
        B[Node.js Instance 1]
        C[Node.js Instance 2]
        D[Node.js Instance 3]
    end
    
    subgraph "Database Cluster"
        E[MongoDB Primary]
        F[MongoDB Secondary]
        G[MongoDB Arbiter]
    end
    
    subgraph "Storage"
        H[File Storage/CDN]
        I[Redis Cache]
    end
    
    subgraph "Monitoring"
        J[Application Logs]
        K[Performance Metrics]
        L[Error Tracking]
    end
    
    A --> B
    A --> C
    A --> D
    
    B --> E
    C --> E
    D --> E
    
    E --> F
    F --> G
    
    B --> H
    C --> H
    D --> H
    
    B --> I
    C --> I
    D --> I
    
    B --> J
    C --> J
    D --> J
    
    B --> K
    C --> K
    D --> K
    
    B --> L
    C --> L
    D --> L
```

### Container Architecture (Docker)

```mermaid
graph TB
    subgraph "Docker Compose"
        A[Frontend Container]
        B[Backend Container]
        C[MongoDB Container]
        D[Redis Container]
        E[Nginx Container]
    end
    
    subgraph "Volumes"
        F[Database Volume]
        G[Upload Volume]
        H[Log Volume]
    end
    
    subgraph "Networks"
        I[Frontend Network]
        J[Backend Network]
        K[Database Network]
    end
    
    A --> I
    B --> I
    B --> J
    C --> J
    D --> J
    E --> I
    
    C --> F
    B --> G
    B --> H
```

## Performance Considerations

### Optimization Strategies

1. **Database Optimization**
   - Proper indexing on frequently queried fields
   - Aggregation pipelines for complex queries
   - Connection pooling

2. **Caching Strategy**
   - Redis for session storage
   - API response caching
   - Static asset caching

3. **File Handling**
   - Image compression and optimization
   - CDN for static file delivery
   - Lazy loading for images

4. **Frontend Optimization**
   - Code splitting and lazy loading
   - Bundle optimization with Vite
   - Service worker for offline support

## Monitoring and Logging

### Logging Strategy

```mermaid
graph TB
    subgraph "Application Logs"
        A[Request Logs]
        B[Error Logs]
        C[Performance Logs]
        D[Security Logs]
    end
    
    subgraph "Log Aggregation"
        E[Winston Logger]
        F[Log Files]
        G[External Service]
    end
    
    subgraph "Monitoring"
        H[Health Checks]
        I[Metrics Collection]
        J[Alerting]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    
    E --> F
    E --> G
    
    F --> H
    G --> I
    I --> J
```

### Key Metrics

- **Performance Metrics**
  - Response time
  - Throughput
  - Error rates
  - Database query performance

- **Business Metrics**
  - User registration rate
  - Report creation rate
  - Report resolution time
  - User engagement

- **Infrastructure Metrics**
  - Server resource usage
  - Database performance
  - File storage usage
  - Network latency

## Scalability Considerations

### Horizontal Scaling

1. **Application Layer**
   - Stateless application design
   - Load balancer distribution
   - Auto-scaling based on metrics

2. **Database Layer**
   - MongoDB replica sets
   - Sharding for large datasets
   - Read replicas for query distribution

3. **Storage Layer**
   - Distributed file storage
   - CDN for global distribution
   - Caching layers

### Future Enhancements

1. **Microservices Architecture**
   - Service decomposition
   - API gateway
   - Service mesh

2. **Real-time Features**
   - WebSocket integration
   - Push notifications
   - Live updates

3. **Advanced Analytics**
   - Data warehouse integration
   - Machine learning for damage assessment
   - Predictive analytics

This architecture documentation provides a comprehensive overview of the LAPOR system design, from high-level architecture to detailed implementation considerations. It serves as a guide for developers, system administrators, and stakeholders to understand the system's structure and design decisions.