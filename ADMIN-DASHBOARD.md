# 🏛️ Atlas Admin Dashboard Backend

**Complete administrative backend system for managing users, content, and system analytics.**

## 🎯 Overview

The Atlas Admin Dashboard provides a comprehensive backend system for administrators to:
- **Monitor system health** and performance metrics
- **Manage users** with role-based access control
- **Moderate content** with approval workflows
- **Analyze system usage** with detailed analytics
- **Export data** for reporting and analysis

## 🔐 Security & Authentication

### Role-Based Access Control
- **Admin Role Required**: All admin routes require `role: 'admin'` in user profile
- **JWT Authentication**: Must provide valid Bearer token
- **Middleware Protection**: `requireAdmin` middleware on all endpoints

### User Roles
```typescript
enum UserRole {
  USER = 'user',        // Regular users
  MODERATOR = 'moderator', // Content moderators  
  ADMIN = 'admin'       // Full system administrators
}
```

## 🌐 API Endpoints

### Base URL: `http://localhost:3001/api/admin`

---

## 📊 Dashboard Routes (`/dashboard`)

### System Overview
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "system": {
        "uptime": { "formatted": "2d 5h 30m", "seconds": 192600 },
        "memory": { "used": 45, "total": 128, "external": 12, "rss": 89 },
        "nodeVersion": "v18.17.0"
      },
      "database": {
        "connected": true,
        "uptime": { "formatted": "2d 5h 29m", "milliseconds": 192540000 },
        "stats": { "users": 150, "events": 89, "organizations": 23 }
      },
      "api": {
        "version": "1.0.0",
        "environment": "production",
        "port": "3001"
      }
    }
  }
}
```

### Detailed Statistics
```http
GET /api/admin/dashboard/stats
Authorization: Bearer <admin_token>
```

### Recent Activity
```http
GET /api/admin/dashboard/recent-activity?limit=20
Authorization: Bearer <admin_token>
```

### System Health
```http
GET /api/admin/dashboard/system-health
Authorization: Bearer <admin_token>
```

---

## 👥 User Management Routes (`/users`)

### List Users
```http
GET /api/admin/users?page=1&limit=20&search=john&role=admin&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search by name, username, or email
- `role` - Filter by role: `user`, `admin`, `moderator`
- `sortBy` - Sort field: `createdAt`, `name`, `lastLogin`
- `sortOrder` - Sort direction: `asc`, `desc`

### Get User Details
```http
GET /api/admin/users/:id
Authorization: Bearer <admin_token>
```

### Update User
```http
PUT /api/admin/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "email": "john.updated@example.com"
}
```

### Update User Role
```http
PUT /api/admin/users/:id/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "admin"
}
```

### Get User Activity
```http
GET /api/admin/users/:id/activity?days=30
Authorization: Bearer <admin_token>
```

### User Statistics Summary
```http
GET /api/admin/users/stats/summary
Authorization: Bearer <admin_token>
```

---

## 📝 Content Moderation Routes (`/content`)

### Get Pending Content
```http
GET /api/admin/content/pending?type=all&limit=20
Authorization: Bearer <admin_token>
```

**Parameters:**
- `type` - Content type: `all`, `event`, `organization`, `lab`

### Approve Content
```http
PUT /api/admin/content/:type/:id/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "notes": "Content approved - meets quality standards"
}
```

### Reject Content
```http
PUT /api/admin/content/:type/:id/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Inappropriate content",
  "notes": "Contains spam links"
}
```

### Get Flagged Content
```http
GET /api/admin/content/flagged
Authorization: Bearer <admin_token>
```

### Flag Content
```http
PUT /api/admin/content/:type/:id/flag
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Spam",
  "notes": "Multiple user reports received"
}
```

### Delete Content
```http
DELETE /api/admin/content/:type/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Violates terms of service"
}
```

### Content Statistics
```http
GET /api/admin/content/stats
Authorization: Bearer <admin_token>
```

---

## 📈 Analytics Routes (`/analytics`)

### System Analytics Overview
```http
GET /api/admin/analytics/overview?period=30
Authorization: Bearer <admin_token>
```

### User Analytics
```http
GET /api/admin/analytics/users?period=30
Authorization: Bearer <admin_token>
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "userAnalytics": {
      "demographics": {
        "total": 1250,
        "byRole": { "admin": 5, "moderator": 15, "user": 1230 },
        "registrationTrends": {
          "daily": [10, 15, 8, 22, 18],
          "weekly": [125, 140, 98, 167],
          "monthly": [530, 720]
        }
      },
      "behavior": {
        "engagement": {
          "averageInterestsPerUser": 4.2,
          "mostPopularInterests": ["AI", "Web Development", "Data Science"]
        },
        "activity": {
          "loginFrequency": { "daily": 450, "weekly": 850, "monthly": 1100 }
        }
      }
    }
  }
}
```

### Content Analytics
```http
GET /api/admin/analytics/content
Authorization: Bearer <admin_token>
```

### Recommendation Analytics
```http
GET /api/admin/analytics/recommendations
Authorization: Bearer <admin_token>
```

### Performance Analytics
```http
GET /api/admin/analytics/performance
Authorization: Bearer <admin_token>
```

### Export Analytics Data
```http
GET /api/admin/analytics/export?format=json&type=overview&period=30
Authorization: Bearer <admin_token>
```

**Parameters:**
- `format` - Export format: `json`, `csv`
- `type` - Data type: `overview`, `users`, `content`, `recommendations`, `performance`
- `period` - Time period in days

---

## 🛠️ Implementation Guide

### 1. Setup Admin User

First, create an admin user by updating an existing user's role in MongoDB:

```javascript
// MongoDB shell or application code
db.users.updateOne(
  { username: 'your_username' },
  { $set: { role: 'admin' } }
);
```

### 2. Admin Authentication Flow

```javascript
// 1. Login as admin user
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin_user',
    password: 'admin_password'
  })
});

const { data } = await loginResponse.json();
const adminToken = data.tokens.accessToken;

// 2. Access admin endpoints
const dashboardResponse = await fetch('/api/admin/dashboard', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
```

### 3. Frontend Integration

```typescript
import axios from 'axios';

class AdminApiClient {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  // Dashboard methods
  async getDashboardOverview() {
    const response = await axios.get(`${this.baseURL}/api/admin/dashboard`, {
      headers: this.headers
    });
    return response.data;
  }

  // User management methods  
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) {
    const response = await axios.get(`${this.baseURL}/api/admin/users`, {
      headers: this.headers,
      params
    });
    return response.data;
  }

  async updateUserRole(userId: string, role: string) {
    const response = await axios.put(
      `${this.baseURL}/api/admin/users/${userId}/role`,
      { role },
      { headers: this.headers }
    );
    return response.data;
  }

  // Content moderation methods
  async getPendingContent(type: string = 'all') {
    const response = await axios.get(
      `${this.baseURL}/api/admin/content/pending`,
      {
        headers: this.headers,
        params: { type }
      }
    );
    return response.data;
  }

  async approveContent(type: string, id: string, notes?: string) {
    const response = await axios.put(
      `${this.baseURL}/api/admin/content/${type}/${id}/approve`,
      { notes },
      { headers: this.headers }
    );
    return response.data;
  }

  // Analytics methods
  async getAnalyticsOverview(period: number = 30) {
    const response = await axios.get(
      `${this.baseURL}/api/admin/analytics/overview`,
      {
        headers: this.headers,
        params: { period }
      }
    );
    return response.data;
  }

  async exportAnalytics(type: string, format: string = 'json') {
    const response = await axios.get(
      `${this.baseURL}/api/admin/analytics/export`,
      {
        headers: this.headers,
        params: { type, format },
        responseType: format === 'csv' ? 'text' : 'json'
      }
    );
    return response.data;
  }
}

// Usage example
const adminClient = new AdminApiClient('http://localhost:3001', adminToken);

// Get dashboard data
const dashboard = await adminClient.getDashboardOverview();

// Get user list
const users = await adminClient.getUsers({ 
  page: 1, 
  limit: 20, 
  role: 'user' 
});

// Approve content
await adminClient.approveContent('event', 'event123', 'Looks good!');

// Get analytics
const analytics = await adminClient.getAnalyticsOverview(30);
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Admin-specific configuration
ADMIN_SESSION_TIMEOUT=3600000  # 1 hour in milliseconds
ADMIN_MAX_LOGIN_ATTEMPTS=5
ADMIN_LOCKOUT_DURATION=1800000 # 30 minutes in milliseconds

# Analytics configuration
ANALYTICS_RETENTION_DAYS=90
ANALYTICS_EXPORT_MAX_ROWS=10000
ANALYTICS_CACHE_TTL=300000     # 5 minutes in milliseconds

# Content moderation
CONTENT_AUTO_APPROVE=false
CONTENT_REQUIRE_MODERATION=true
CONTENT_MAX_PENDING_ITEMS=1000
```

### Database Indexes

For optimal performance, create these MongoDB indexes:

```javascript
// User management indexes
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "createdAt": -1 });
db.users.createIndex({ "lastLogin": -1 });
db.users.createIndex({ "username": "text", "email": "text", "name": "text" });

// Content moderation indexes
db.events.createIndex({ "createdAt": -1 });
db.organizations.createIndex({ "createdAt": -1 });
db.labs.createIndex({ "createdAt": -1 });

// Analytics indexes (if implementing activity tracking)
// db.activities.createIndex({ "timestamp": -1 });
// db.activities.createIndex({ "userId": 1, "timestamp": -1 });
```

---

## 📊 Data Structures

### User Management

```typescript
interface AdminUser {
  id: string;
  userId: number;
  name: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  interests: number[];
  interestCount: number;
}

interface UserActivity {
  summary: {
    totalLogins: number;
    eventsCreated: number;
    organizationsCreated: number;
    recommendationsViewed: number;
    lastActive?: Date;
  };
  timeline: ActivityEvent[];
  analytics: {
    loginPattern: {
      hourly: number[];
      daily: number[];
      weekly: number[];
    };
    engagement: {
      eventsViewed: number;
      searchQueries: number;
      recommendationsAccepted: number;
    };
  };
}
```

### Content Moderation

```typescript
interface ContentItem {
  id: string;
  type: 'event' | 'organization' | 'lab';
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  createdBy: string;
  createdAt: Date;
  flagReason?: string;
  reportCount?: number;
}

interface ModerationAction {
  id: string;
  type: string;
  status: 'approved' | 'rejected' | 'flagged';
  reason?: string;
  moderationNotes?: string;
  actionAt: string;
}
```

### Analytics

```typescript
interface SystemAnalytics {
  overview: {
    period: { days: number; startDate: string; endDate: string };
    summary: {
      totalUsers: number;
      totalEvents: number;
      totalOrganizations: number;
      totalLabs: number;
    };
    growth: {
      users: { current: number; change: number; percentage: number };
      content: {
        events: { current: number; change: number; percentage: number };
        organizations: { current: number; change: number; percentage: number };
        labs: { current: number; change: number; percentage: number };
      };
    };
  };
  engagement: {
    activeUsers: number;
    averageSessionDuration: number;
    pageViews: number;
    apiRequests: number;
  };
}
```

---

## 🚦 Error Handling

### Authentication Errors

```json
// 401 - Not authenticated
{
  "success": false,
  "error": "Authentication required",
  "message": "Please login to access admin features"
}

// 403 - Not authorized (not admin)
{
  "success": false,
  "error": "Admin access required", 
  "message": "This endpoint requires administrator privileges"
}
```

### Validation Errors

```json
// 400 - Invalid role
{
  "success": false,
  "error": "Invalid role",
  "message": "Role must be one of: user, admin, moderator"
}

// 400 - Missing required field
{
  "success": false,
  "error": "Rejection reason required",
  "message": "Please provide a reason for rejecting this content"
}
```

### Resource Errors

```json
// 404 - User not found
{
  "success": false,
  "error": "User not found",
  "message": "No user found with the provided ID"
}
```

---

## 🧪 Testing

### Manual Testing

```bash
# 1. Create admin user (via MongoDB)
mongosh atlas
db.users.updateOne(
  { username: 'testadmin' }, 
  { $set: { role: 'admin' } }
)

# 2. Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin","password":"password123"}'

# 3. Test admin endpoints (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/admin/dashboard

curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/admin/users

curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/admin/content/pending

curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/admin/analytics/overview
```

### Integration Testing

```typescript
// Create test suite for admin functionality
describe('Admin Dashboard API', () => {
  let adminToken: string;
  let regularToken: string;

  beforeEach(async () => {
    // Setup admin and regular user tokens
    adminToken = await getAdminToken();
    regularToken = await getRegularToken();
  });

  describe('Authentication', () => {
    it('should require admin role', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Admin access required');
    });
  });

  describe('User Management', () => {
    it('should list users with pagination', async () => {
      const response = await request(app)
        .get('/api/admin/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeInstanceOf(Array);
    });

    it('should update user role', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'moderator' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('moderator');
    });
  });
});
```

---

## 🎯 Production Considerations

### Performance Optimization

1. **Caching**: Implement Redis caching for frequently accessed data:
   ```typescript
   // Cache dashboard data for 5 minutes
   const cacheKey = `admin:dashboard:${period}`;
   const cachedData = await redis.get(cacheKey);
   if (cachedData) return JSON.parse(cachedData);
   ```

2. **Database Optimization**: 
   - Add indexes for common queries
   - Use aggregation pipelines for complex analytics
   - Implement pagination for large datasets

3. **Rate Limiting**: Implement stricter rate limiting for admin endpoints:
   ```typescript
   const adminRateLimit = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // Max 100 requests per window
     message: 'Too many admin requests'
   });
   ```

### Security Enhancements

1. **Activity Logging**: Log all admin actions:
   ```typescript
   await logAdminAction({
     adminId: req.user.userId,
     action: 'USER_ROLE_UPDATE',
     target: userId,
     details: { oldRole, newRole },
     ipAddress: req.ip,
     timestamp: new Date()
   });
   ```

2. **IP Whitelisting**: Restrict admin access to specific IPs
3. **Session Management**: Implement admin session tracking
4. **Audit Trail**: Maintain comprehensive audit logs

### Monitoring & Alerts

1. **Health Checks**: Monitor admin system health
2. **Error Tracking**: Track admin-specific errors  
3. **Usage Analytics**: Monitor admin usage patterns
4. **Alert System**: Alert on suspicious admin activity

---

## 🎉 Conclusion

The Atlas Admin Dashboard Backend provides a complete administrative interface for managing your Atlas platform. With comprehensive user management, content moderation, detailed analytics, and robust security, administrators have all the tools needed to maintain and optimize the system.

**Key Features:**
- ✅ **Role-based Security** - Admin, moderator, and user roles
- ✅ **User Management** - Complete user lifecycle management
- ✅ **Content Moderation** - Approval workflows and flagging system
- ✅ **Analytics & Reporting** - Detailed system insights and data export
- ✅ **Performance Monitoring** - System health and performance metrics
- ✅ **Production Ready** - Error handling, validation, and security features

Ready for production deployment with comprehensive documentation, testing guidelines, and performance optimization recommendations!