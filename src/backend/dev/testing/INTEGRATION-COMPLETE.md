# 🎯 Atlas Backend - Complete Integration

**Complete, production-ready backend system with authentication, recommendations, and REST API.**

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Start Production Server
```bash
npm run build
npm start
```

## 🏗️ System Architecture

```
Atlas Backend System
├── 🔐 JWT Authentication System
├── 🤖 AI-Powered Recommendation Engine  
├── 🌐 Complete REST API
├── 🗄️ MongoDB Integration
├── 🛡️ Security & Rate Limiting
└── 📊 Health Monitoring
```

## 📋 Available Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `npm run dev` | Development server with hot reload | Development |
| `npm run build` | Build for production | Build step |
| `npm start` | Start production server | Production |
| `npm run dev:api` | API server only (development) | API testing |

## 🔧 Configuration

### Required Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017
DB_NAME=atlas

# API Server  
API_PORT=3001
JWT_SECRET=your-32-plus-character-secret-key

# Optional: AI Features
GEMINI_API_KEY=your_gemini_api_key
```

### Optional Configuration
```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

## 🌐 API Endpoints

### Base URL: `http://localhost:3001/api`

#### 🔐 Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user  
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

#### 📅 Events
- `GET /events` - List events
- `GET /events/:id` - Get event details
- `POST /events` - Create event (requires auth)
- `GET /events/search?q=query` - Search events
- `GET /events/by-date?startDate=&endDate=` - Filter by date
- `GET /events/by-tags?tagIds=id1,id2` - Filter by tags

#### 🏢 Organizations
- `GET /organizations` - List organizations
- `GET /organizations/:id` - Get organization details
- `POST /organizations` - Create organization (requires auth)
- `GET /organizations/search?q=query` - Search organizations

#### 🔬 Labs
- `GET /labs` - List labs
- `GET /labs/:id` - Get lab details
- `POST /labs` - Create lab (requires auth)
- `GET /labs/search?q=query` - Search labs
- `GET /labs/by-research-area?researchArea=area` - Filter by research area

#### 🎯 Recommendations
- `GET /recommendations/events/:userId` - Event recommendations
- `GET /recommendations/organizations/:userId` - Organization recommendations  
- `GET /recommendations/labs/:userId` - Lab recommendations

#### 🏷️ Tags & Interests
- `GET /tags/primary` - Primary tags
- `GET /tags/secondary` - Secondary tags
- `GET /interests` - List interests
- `GET /interests/search?q=query` - Search interests

### 💓 Health & Monitoring
- `GET /health` - System health check
- `GET /api/health` - API health check

## 🔒 Authentication Flow

### 1. Register/Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'user', password: 'pass'})
});
const {data} = await response.json();
const accessToken = data.tokens.accessToken;
```

### 2. Authenticated Requests
```javascript
const response = await fetch('/api/events', {
  headers: {'Authorization': `Bearer ${accessToken}`}
});
```

### 3. Token Refresh
```javascript
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({refreshToken: refreshToken})
});
```

## 🤖 Recommendation System

### Features
- **Content-Based Filtering**: Based on user interests and tags
- **Collaborative Filtering**: Based on similar users' preferences  
- **Hybrid Algorithm**: Combines both approaches for optimal results
- **Real-time Scoring**: Dynamic recommendation scoring with explanations

### Usage
```javascript
// Get personalized event recommendations
const recommendations = await fetch(`/api/recommendations/events/${userId}?limit=10`, {
  headers: {'Authorization': `Bearer ${accessToken}`}
});
```

## 🛡️ Security Features

- **JWT Authentication**: 15-minute access tokens, 7-day refresh tokens
- **Rate Limiting**: 1000 requests per 15 minutes per IP
- **Input Validation**: Request validation on all endpoints
- **CORS Protection**: Configurable cross-origin policies
- **Helmet Security**: Security headers and CSP
- **Password Hashing**: bcrypt with configurable salt rounds

## 📊 System Integration

### Database Handler
- MongoDB connection management
- CRUD operations for all entities
- Population of related data
- Error handling and retry logic

### Middleware Stack
- CORS configuration
- Rate limiting
- JSON body parsing
- Security headers
- Request logging
- Error handling

### Service Layer
- JWT token management
- Password hashing and validation
- Recommendation algorithms
- Database query optimization

## 🔍 Usage Examples

### Complete Integration Example
```bash
# Run the integration demonstration
npx tsx atlas-integration-example.ts
```

### Manual API Testing
```bash
# Start the server
npm run dev

# Test endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/events
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"test","email":"test@example.com","password":"SecurePass123!"}'
```

## 🏃‍♂️ Development Workflow

### 1. Development Setup
```bash
git clone <repository>
cd atlas
cp .env.example .env
npm install
npm run dev
```

### 2. API Development
- Server runs on `http://localhost:3001`
- Hot reloading via `tsx`
- Debug logging enabled
- Detailed error messages

### 3. Production Deployment
```bash
npm run build
npm start
```

## 🔧 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Change API_PORT in .env
API_PORT=3002
```

**Database Connection Failed**
```bash
# Check MongoDB is running
mongosh
# Update MONGODB_URI in .env
```

**JWT Token Invalid**
```bash
# Ensure JWT_SECRET is 32+ characters
# Check token expiry times
```

**Rate Limit Exceeded**
```bash
# Adjust rate limits in .env
RATE_LIMIT_MAX_REQUESTS=2000
RATE_LIMIT_WINDOW_MS=900000
```

## 📈 Performance & Monitoring

### Health Checks
- Database connectivity
- Server uptime
- Memory usage
- Process health

### Logging
- Request/response logging
- Error tracking
- Performance metrics
- Security events

### Graceful Shutdown
- Signal handling (SIGTERM, SIGINT)
- Database connection cleanup
- Active request completion
- Process termination

## 🧪 Testing

### Integration Test
```bash
# Run complete system test
npx tsx atlas-integration-example.ts
```

### Manual Testing
```bash
# Health check
curl http://localhost:3001/health

# API endpoints
curl http://localhost:3001/api/events
curl http://localhost:3001/api/organizations
curl http://localhost:3001/api/tags/primary
```

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Strong JWT secret (32+ characters)  
- [ ] MongoDB connection tested
- [ ] CORS origins configured
- [ ] Rate limits appropriate
- [ ] SSL/TLS enabled (reverse proxy)
- [ ] Process manager configured (PM2/Docker)
- [ ] Health monitoring setup
- [ ] Log aggregation configured
- [ ] Backup strategy in place

## 📚 API Client Library

Use the included `AtlasApiClient` class for easy integration:

```typescript
import { AtlasApiClient } from './atlas-integration-example';

const client = new AtlasApiClient('http://localhost:3001');

// Authenticate
await client.login({username: 'user', password: 'pass'});

// Use authenticated endpoints
const events = await client.getEvents({limit: 10});
const recommendations = await client.getEventRecommendations(userId);
```

---

**🎉 Atlas Backend is now fully integrated and production-ready!**

The system provides:
✅ Complete authentication with JWT tokens  
✅ AI-powered recommendation engine  
✅ Full REST API with CRUD operations  
✅ Security middleware and rate limiting  
✅ Health monitoring and graceful shutdown  
✅ Production deployment configuration  
✅ Comprehensive documentation and examples