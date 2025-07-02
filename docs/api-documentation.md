# LAPOR API Documentation

## Overview

The LAPOR API is a RESTful web service that provides endpoints for managing road damage reports, user authentication, and administrative functions. The API follows REST principles and returns JSON responses.

**Base URL**: `http://localhost:3000/api`
**Version**: 1.0.0
**Authentication**: JWT Bearer Token

## Table of Contents

1. [Authentication](#authentication)
2. [Reports](#reports)
3. [Users](#users)
4. [Admin](#admin)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [File Uploads](#file-uploads)

## Authentication

All protected endpoints require a valid JWT token in the Authorization header.

### Register User

**Endpoint**: `POST /api/auth/register`

**Description**: Register a new user account

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Validation Rules**:
- `name`: Required, 2-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2023-07-03T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists

### Login User

**Endpoint**: `POST /api/auth/login`

**Description**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid credentials
- `401 Unauthorized`: Account inactive

### Get User Profile

**Endpoint**: `GET /api/auth/profile`

**Description**: Get current user's profile information

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2023-07-03T10:30:00.000Z",
      "updatedAt": "2023-07-03T10:30:00.000Z"
    }
  }
}
```

### Update Profile

**Endpoint**: `PUT /api/auth/profile`

**Description**: Update current user's profile

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "John Smith",
      "email": "john.smith@example.com",
      "role": "user",
      "updatedAt": "2023-07-03T11:30:00.000Z"
    }
  }
}
```

### Change Password

**Endpoint**: `PUT /api/auth/change-password`

**Description**: Change user's password

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## Reports

### Create Report

**Endpoint**: `POST /api/reports`

**Description**: Create a new road damage report

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body (Form Data)**:
- `description` (string, required): Report description (10-1000 characters)
- `latitude` (number, required): Latitude coordinate (-90 to 90)
- `longitude` (number, required): Longitude coordinate (-180 to 180)
- `address` (string, optional): Human-readable address
- `photo` (file, required): Image file (JPEG, PNG, GIF, WebP, max 5MB)

**Example using curl**:
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Authorization: Bearer <jwt-token>" \
  -F "description=Large pothole on main road causing traffic issues" \
  -F "latitude=-6.2088" \
  -F "longitude=106.8456" \
  -F "address=Jl. Sudirman, Jakarta Pusat" \
  -F "photo=@/path/to/image.jpg"
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "report": {
      "_id": "64a1b2c3d4e5f6789012346",
      "user": "64a1b2c3d4e5f6789012345",
      "description": "Large pothole on main road causing traffic issues",
      "latitude": -6.2088,
      "longitude": 106.8456,
      "address": "Jl. Sudirman, Jakarta Pusat",
      "photoPath": "/uploads/reports/1688380200000-photo.jpg",
      "status": "pending",
      "createdAt": "2023-07-03T12:30:00.000Z",
      "updatedAt": "2023-07-03T12:30:00.000Z"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or missing token
- `413 Payload Too Large`: File size exceeds limit
- `415 Unsupported Media Type`: Invalid file type

### Get All Reports

**Endpoint**: `GET /api/reports`

**Description**: Get paginated list of reports (Admin only)

**Headers**:
```
Authorization: Bearer <admin-jwt-token>
```

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `status` (string, optional): Filter by status (pending, verified, rejected, in_progress, working, completed)
- `sortBy` (string, optional): Sort field (createdAt, updatedAt, status)
- `sortOrder` (string, optional): Sort order (asc, desc, default: desc)
- `search` (string, optional): Search in description and address
- `startDate` (string, optional): Filter from date (ISO format)
- `endDate` (string, optional): Filter to date (ISO format)

**Example Request**:
```
GET /api/reports?page=1&limit=20&status=pending&sortBy=createdAt&sortOrder=desc
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "_id": "64a1b2c3d4e5f6789012346",
        "user": {
          "_id": "64a1b2c3d4e5f6789012345",
          "name": "John Doe",
          "email": "john.doe@example.com"
        },
        "description": "Large pothole on main road",
        "latitude": -6.2088,
        "longitude": 106.8456,
        "address": "Jl. Sudirman, Jakarta Pusat",
        "photoPath": "/uploads/reports/1688380200000-photo.jpg",
        "status": "pending",
        "createdAt": "2023-07-03T12:30:00.000Z",
        "updatedAt": "2023-07-03T12:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalReports": 47,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "status": "pending",
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  }
}
```

### Get Report by ID

**Endpoint**: `GET /api/reports/:id`

**Description**: Get specific report details

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Parameters**:
- `id` (string, required): Report ID

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "report": {
      "_id": "64a1b2c3d4e5f6789012346",
      "user": {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "description": "Large pothole on main road",
      "latitude": -6.2088,
      "longitude": 106.8456,
      "address": "Jl. Sudirman, Jakarta Pusat",
      "photoPath": "/uploads/reports/1688380200000-photo.jpg",
      "status": "pending",
      "adminNotes": null,
      "createdAt": "2023-07-03T12:30:00.000Z",
      "updatedAt": "2023-07-03T12:30:00.000Z"
    }
  }
}
```

**Error Responses**:
- `404 Not Found`: Report not found
- `403 Forbidden`: Access denied (user can only view own reports)

### Update Report Status

**Endpoint**: `PUT /api/reports/:id`

**Description**: Update report status and add admin notes (Admin only)

**Headers**:
```
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Parameters**:
- `id` (string, required): Report ID

**Request Body**:
```json
{
  "status": "verified",
  "adminNotes": "Report verified and forwarded to maintenance team"
}
```

**Validation Rules**:
- `status`: Required, one of (pending, verified, rejected, in_progress, working, completed)
- `adminNotes`: Optional, max 500 characters

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Report updated successfully",
  "data": {
    "report": {
      "_id": "64a1b2c3d4e5f6789012346",
      "status": "verified",
      "adminNotes": "Report verified and forwarded to maintenance team",
      "updatedAt": "2023-07-03T14:30:00.000Z"
    }
  }
}
```

### Delete Report

**Endpoint**: `DELETE /api/reports/:id`

**Description**: Delete a report (Admin only)

**Headers**:
```
Authorization: Bearer <admin-jwt-token>
```

**Parameters**:
- `id` (string, required): Report ID

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

### Get User's Reports

**Endpoint**: `GET /api/reports/my-reports`

**Description**: Get current user's reports

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `status` (string, optional): Filter by status

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "_id": "64a1b2c3d4e5f6789012346",
        "description": "Large pothole on main road",
        "latitude": -6.2088,
        "longitude": 106.8456,
        "address": "Jl. Sudirman, Jakarta Pusat",
        "photoPath": "/uploads/reports/1688380200000-photo.jpg",
        "status": "pending",
        "createdAt": "2023-07-03T12:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalReports": 15,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Users

### Get All Users

**Endpoint**: `GET /api/users`

**Description**: Get paginated list of users (Admin only)

**Headers**:
```
Authorization: Bearer <admin-jwt-token>
```

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search by name or email
- `role` (string, optional): Filter by role (user, admin)
- `isActive` (boolean, optional): Filter by active status

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "user",
        "isActive": true,
        "createdAt": "2023-07-03T10:30:00.000Z",
        "reportCount": 5
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalUsers": 95,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Update User Status

**Endpoint**: `PUT /api/users/:id/status`

**Description**: Activate or deactivate user account (Admin only)

**Headers**:
```
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Parameters**:
- `id` (string, required): User ID

**Request Body**:
```json
{
  "isActive": false
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "isActive": false,
      "updatedAt": "2023-07-03T15:30:00.000Z"
    }
  }
}
```

## Admin

### Get Dashboard Statistics

**Endpoint**: `GET /api/admin/dashboard`

**Description**: Get dashboard statistics (Admin only)

**Headers**:
```
Authorization: Bearer <admin-jwt-token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalReports": 150,
      "pendingReports": 25,
      "verifiedReports": 45,
      "inProgressReports": 30,
      "completedReports": 40,
      "rejectedReports": 10,
      "totalUsers": 95,
      "activeUsers": 88,
      "newReportsToday": 8,
      "newUsersToday": 3
    },
    "recentReports": [
      {
        "_id": "64a1b2c3d4e5f6789012346",
        "description": "Large pothole on main road",
        "status": "pending",
        "user": {
          "name": "John Doe"
        },
        "createdAt": "2023-07-03T12:30:00.000Z"
      }
    ],
    "statusDistribution": [
      { "status": "pending", "count": 25 },
      { "status": "verified", "count": 45 },
      { "status": "in_progress", "count": 30 },
      { "status": "completed", "count": 40 },
      { "status": "rejected", "count": 10 }
    ]
  }
}
```

### Get Reports Analytics

**Endpoint**: `GET /api/admin/analytics/reports`

**Description**: Get detailed reports analytics (Admin only)

**Headers**:
```
Authorization: Bearer <admin-jwt-token>
```

**Query Parameters**:
- `period` (string, optional): Time period (7d, 30d, 90d, 1y, default: 30d)
- `groupBy` (string, optional): Group by (day, week, month, default: day)

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "analytics": {
      "totalReports": 150,
      "averageResolutionTime": "5.2 days",
      "reportsByStatus": {
        "pending": 25,
        "verified": 45,
        "in_progress": 30,
        "completed": 40,
        "rejected": 10
      },
      "reportsByPeriod": [
        {
          "date": "2023-07-01",
          "count": 8
        },
        {
          "date": "2023-07-02",
          "count": 12
        }
      ],
      "topLocations": [
        {
          "address": "Jl. Sudirman, Jakarta",
          "count": 15
        },
        {
          "address": "Jl. Thamrin, Jakarta",
          "count": 12
        }
      ]
    }
  }
}
```

## Error Handling

### Error Response Format

All error responses follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "type": "field",
      "value": "invalid-value",
      "msg": "Field validation message",
      "path": "fieldName",
      "location": "body"
    }
  ]
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `413 Payload Too Large`: File size exceeds limit
- `415 Unsupported Media Type`: Invalid file type
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Common Error Examples

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Description is required",
      "path": "description",
      "location": "body"
    },
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Please provide a valid email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

#### Authentication Error (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

#### Authorization Error (403)
```json
{
  "success": false,
  "message": "Access denied. Admin role required"
}
```

#### Not Found Error (404)
```json
{
  "success": false,
  "message": "Report not found"
}
```

## Rate Limiting

API endpoints are protected by rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **File upload endpoints**: 10 requests per 15 minutes per user

### Rate Limit Headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1688380800
```

### Rate Limit Exceeded Response (429)

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

## File Uploads

### Supported File Types

- **Images**: JPEG, JPG, PNG, GIF, WebP
- **Maximum size**: 5MB per file
- **Storage**: Local filesystem (configurable to cloud storage)

### File Upload Security

1. **File type validation**: Only allowed MIME types accepted
2. **File size limits**: Configurable maximum file size
3. **Filename sanitization**: Special characters removed
4. **Virus scanning**: Optional integration with antivirus
5. **Storage isolation**: Uploaded files stored outside web root

### File Access

**Endpoint**: `GET /uploads/reports/:filename`

**Description**: Access uploaded report images

**Example**: `GET /uploads/reports/1688380200000-photo.jpg`

**Response**: Binary image data with appropriate Content-Type header

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class LaporAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async login(email, password) {
    const response = await axios.post(`${this.baseURL}/auth/login`, {
      email,
      password
    });
    this.token = response.data.data.token;
    this.client.defaults.headers['Authorization'] = `Bearer ${this.token}`;
    return response.data;
  }

  async createReport(description, latitude, longitude, photoPath, address) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('photo', fs.createReadStream(photoPath));
    if (address) formData.append('address', address);

    const response = await this.client.post('/reports', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    return response.data;
  }

  async getReports(params = {}) {
    const response = await this.client.get('/reports', { params });
    return response.data;
  }

  async updateReportStatus(reportId, status, adminNotes) {
    const response = await this.client.put(`/reports/${reportId}`, {
      status,
      adminNotes
    });
    return response.data;
  }
}

// Usage
const api = new LaporAPI('http://localhost:3000/api');

// Login
const loginResult = await api.login('admin@example.com', 'password');
console.log('Logged in:', loginResult.data.user.name);

// Create report
const report = await api.createReport(
  'Large pothole causing traffic issues',
  -6.2088,
  106.8456,
  './photo.jpg',
  'Jl. Sudirman, Jakarta'
);
console.log('Report created:', report.data.report._id);

// Get reports
const reports = await api.getReports({ status: 'pending', limit: 20 });
console.log('Found reports:', reports.data.reports.length);
```

### Python

```python
import requests
import json

class LaporAPI:
    def __init__(self, base_url, token=None):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        if token:
            self.session.headers.update({'Authorization': f'Bearer {token}'})
    
    def login(self, email, password):
        response = self.session.post(f'{self.base_url}/auth/login', json={
            'email': email,
            'password': password
        })
        response.raise_for_status()
        data = response.json()
        self.token = data['data']['token']
        self.session.headers.update({'Authorization': f'Bearer {self.token}'})
        return data
    
    def create_report(self, description, latitude, longitude, photo_path, address=None):
        data = {
            'description': description,
            'latitude': latitude,
            'longitude': longitude
        }
        if address:
            data['address'] = address
        
        files = {'photo': open(photo_path, 'rb')}
        
        response = self.session.post(f'{self.base_url}/reports', data=data, files=files)
        response.raise_for_status()
        return response.json()
    
    def get_reports(self, **params):
        response = self.session.get(f'{self.base_url}/reports', params=params)
        response.raise_for_status()
        return response.json()
    
    def update_report_status(self, report_id, status, admin_notes=None):
        data = {'status': status}
        if admin_notes:
            data['adminNotes'] = admin_notes
        
        response = self.session.put(f'{self.base_url}/reports/{report_id}', json=data)
        response.raise_for_status()
        return response.json()

# Usage
api = LaporAPI('http://localhost:3000/api')

# Login
login_result = api.login('admin@example.com', 'password')
print(f"Logged in: {login_result['data']['user']['name']}")

# Create report
report = api.create_report(
    'Large pothole causing traffic issues',
    -6.2088,
    106.8456,
    './photo.jpg',
    'Jl. Sudirman, Jakarta'
)
print(f"Report created: {report['data']['report']['_id']}")

# Get reports
reports = api.get_reports(status='pending', limit=20)
print(f"Found reports: {len(reports['data']['reports'])}")
```

## Testing

### Postman Collection

A Postman collection is available for testing all API endpoints. Import the collection file `LAPOR-API.postman_collection.json` into Postman.

### Environment Variables

Set up the following environment variables in Postman:

- `baseUrl`: `http://localhost:3000/api`
- `userToken`: JWT token for regular user
- `adminToken`: JWT token for admin user

### Test Data

Sample test data is available in the `server/tests/fixtures/` directory.

This comprehensive API documentation provides all the information needed to integrate with the LAPOR API, including detailed endpoint specifications, request/response examples, error handling, and SDK examples in multiple programming languages.