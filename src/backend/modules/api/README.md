# Atlas API

Complete REST API for the Atlas platform, providing endpoints for authentication, events, organizations, labs, interests, tags, and recommendations.

## 🏗️ Architecture

```
src/backend/modules/api/
├── routes/                 # API route definitions
│   ├── auth.ts            # Authentication endpoints
│   ├── events.ts          # Event management
│   ├── organizations.ts   # Organization management
│   ├── labs.ts           # Lab management
│   ├── users.ts          # User management
│   ├── interests.ts      # Interest management
│   ├── tags.ts           # Tag management
│   └── recommendations.ts # Recommendation endpoints
├── index.ts              # Route initialization and mounting
├── server.ts             # Express server configuration
├── start.ts              # Server startup example
└── README.md            # This documentation
```

## 🚀 Quick Start

```typescript
import AtlasApiServer from './server';

const server = new AtlasApiServer({
  port: 3001,
  dbUrl: 'mongodb://localhost:27017/atlas',
});

await server.start();
```

## 📋 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Events (`/api/events`)
- `GET /api/events` - Get all events with pagination
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event (requires auth)
- `GET /api/events/search?q=query` - Search events
- `GET /api/events/by-date?startDate=&endDate=` - Get events by date range
- `GET /api/events/by-tags?tagIds=id1,id2` - Get events by tags

### Organizations (`/api/organizations`)
- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get organization by ID
- `POST /api/organizations` - Create new organization (requires auth)
- `GET /api/organizations/search?q=query` - Search organizations
- `GET /api/organizations/by-category?category=name` - Get organizations by category

### Labs (`/api/labs`)
- `GET /api/labs` - Get all labs
- `GET /api/labs/:id` - Get lab by ID
- `POST /api/labs` - Create new lab (requires auth)
- `GET /api/labs/search?q=query` - Search labs
- `GET /api/labs/by-research-area?researchArea=area` - Get labs by research area

### Users (`/api/users`)
- `GET /api/users/:id` - Get user by ID (requires auth)
- `POST /api/users` - Create new user

### Interests (`/api/interests`)
- `GET /api/interests` - Get all interests
- `GET /api/interests/:id` - Get interest by ID
- `POST /api/interests` - Create new interest (requires auth)
- `GET /api/interests/search?q=query` - Search interests

### Tags (`/api/tags`)
- `GET /api/tags/primary` - Get primary tags
- `GET /api/tags/secondary?parentTagId=id` - Get secondary tags
- `GET /api/tags/by-name/:name` - Get tag by name
- `GET /api/tags/:id` - Get tag by ID
- `POST /api/tags` - Create new tag (requires auth)

### Recommendations (`/api/recommendations`)
- `GET /api/recommendations/events/:userId?limit=10` - Get event recommendations
- `GET /api/recommendations/organizations/:userId?limit=10` - Get organization recommendations
- `GET /api/recommendations/labs/:userId?limit=10` - Get lab recommendations
- `GET /api/recommendations/metrics` - Get system statistics

## 🔐 Authentication

The API uses JWT-based authentication:

1. **Access Tokens**: Short-lived (15 minutes) for API requests
2. **Refresh Tokens**: Long-lived (7 days) for token renewal
3. **Protection**: All creation endpoints and user-specific data require authentication

### Usage

Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## 📊 Response Format

All endpoints return responses in this format:

```typescript
{
  success: boolean,
  data?: any,
  error?: string,
  message?: string,
  count?: number,
  pagination?: {
    limit: number,
    skip: number
  }
}
```

## 🔧 Configuration

Server configuration options:

```typescript
interface ServerConfig {
  port: number;
  dbUrl: string;
  cors?: {
    origin: string[];
    credentials: boolean;
  };
  rateLimiting?: {
    windowMs: number;
    max: number;
  };
}
```

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin request control
- **Rate Limiting**: Request throttling (1000/15min per IP)
- **Input Validation**: Request validation middleware
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds

## 📈 Monitoring

### Health Check

- `GET /health` - Server and database health status
- `GET /api/health` - API-specific health check

### Logging

- Request logging with timestamps
- Error logging with stack traces (development)
- Graceful shutdown handling

## 🔗 Integration

The API integrates with existing Atlas modules:

- **Database Handler**: All CRUD operations use existing handler methods
- **Authentication System**: Complete JWT-based auth with middleware
- **Recommendation Engine**: Hybrid recommendation algorithms
- **Schema Validation**: Uses existing User, Event, Organization, Lab, Tag, Interest schemas

## 🚦 Error Handling

- **Global Error Handler**: Catches unhandled errors
- **Validation Errors**: Clear field validation messages
- **Database Errors**: Graceful error responses
- **Rate Limit Errors**: Informative throttling messages

## 🔄 Development

For development, ensure you have:

1. MongoDB running locally or connection string
2. Environment variables set (PORT, MONGODB_URI)
3. All dependencies installed (express, cors, helmet, etc.)

```bash
# Install dependencies (if not already installed)
npm install express cors helmet express-rate-limit

# Start the server
npm run start:api
```

## 🎯 Usage Examples

### Register and Login

```javascript
// Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'SecurePassword123!'
  })
});

// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    password: 'SecurePassword123!'
  })
});

const { data } = await loginResponse.json();
const accessToken = data.tokens.accessToken;
```

### Fetch Events

```javascript
// Get all events
const events = await fetch('/api/events?limit=20&sortBy=startDate');

// Search events
const searchResults = await fetch('/api/events/search?q=conference');

// Get events by tags
const taggedEvents = await fetch('/api/events/by-tags?tagIds=tag1,tag2');
```

### Get Recommendations

```javascript
// Get personalized event recommendations
const recommendations = await fetch(`/api/recommendations/events/${userId}`, {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

## 🤝 Integration Notes

- **No New Schemas**: Uses existing database schemas
- **Existing Methods**: Leverages all existing handler methods
- **Auth Integration**: Works with existing JWT auth system
- **Recommendation Integration**: Uses existing recommendation service
- **Proper Structure**: Follows backend/modules/api directory structure