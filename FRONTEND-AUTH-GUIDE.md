# 🔐 Atlas Authentication API Guide

**Complete frontend integration guide for Atlas authentication system**

## 📋 Quick Reference

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/auth/register` | POST | Create new user account | No |
| `/api/auth/login` | POST | Login existing user | No |
| `/api/auth/refresh` | POST | Refresh access token | No* |
| `/api/auth/logout` | POST | Logout user | No* |
| `/api/auth/me` | GET | Get current user profile | Yes |

**Base URL:** `http://localhost:3001` (development)

---

## 🚀 Getting Started

### Authentication Flow Overview

1. **Registration/Login** → Get access & refresh tokens
2. **Store tokens** securely (localStorage/sessionStorage)
3. **Include access token** in all authenticated requests
4. **Refresh tokens** when they expire (15min lifetime)
5. **Logout** to revoke tokens

---

## 📝 API Endpoints

### 1. **User Registration**

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2025-09-28T08:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900,
      "tokenType": "Bearer"
    }
  }
}
```

**Error Responses:**
```json
// 400 - Validation Error
{
  "success": false,
  "error": "Validation failed",
  "message": "Username must be at least 3 characters"
}

// 400 - User Exists
{
  "success": false,
  "error": "Username already exists",
  "message": "Please choose a different username"
}
```

---

### 2. **User Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "lastLogin": "2025-09-28T08:35:00.000Z",
      "interests": [1, 2, 3]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900,
      "tokenType": "Bearer"
    }
  }
}
```

**Error Responses:**
```json
// 401 - Invalid Credentials
{
  "success": false,
  "error": "Invalid credentials", 
  "message": "Username or password is incorrect"
}

// 429 - Rate Limited
{
  "success": false,
  "error": "Too many requests",
  "message": "Rate limit exceeded, please try again later"
}
```

---

### 3. **Refresh Access Token**

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

**Error Response:**
```json
// 401 - Invalid Refresh Token
{
  "success": false,
  "error": "Invalid refresh token",
  "message": "Please login again"
}
```

---

### 4. **Get Current User**

```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe", 
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "interests": [1, 2, 3],
      "lastLogin": "2025-09-28T08:35:00.000Z",
      "createdAt": "2025-09-28T08:30:00.000Z"
    }
  }
}
```

**Error Responses:**
```json
// 401 - No Token
{
  "success": false,
  "error": "Authentication required",
  "message": "Please provide a valid authorization header"
}

// 401 - Invalid Token
{
  "success": false,
  "error": "Invalid token",
  "message": "Please login again"
}
```

---

### 5. **Logout User**

```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 💻 Frontend Implementation Examples

### React/JavaScript Integration

```typescript
// auth.service.ts
class AuthService {
  private baseURL = 'http://localhost:3001/api/auth';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from storage on init
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // Register new user
  async register(userData: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) {
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (data.success) {
      this.setTokens(data.data.tokens);
      return data.data.user;
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  }

  // Login existing user
  async login(username: string, password: string) {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (data.success) {
      this.setTokens(data.data.tokens);
      return data.data.user;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  }

  // Get current user profile
  async getCurrentUser() {
    const response = await this.authenticatedRequest(`${this.baseURL}/me`);
    const data = await response.json();
    
    if (data.success) {
      return data.data.user;
    } else {
      throw new Error(data.message || 'Failed to get user profile');
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    const data = await response.json();
    
    if (data.success) {
      this.accessToken = data.data.accessToken;
      localStorage.setItem('accessToken', this.accessToken!);
      return this.accessToken;
    } else {
      // Refresh failed, need to login again
      this.logout();
      throw new Error('Session expired, please login again');
    }
  }

  // Logout user
  async logout() {
    if (this.refreshToken) {
      try {
        await fetch(`${this.baseURL}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      } catch (error) {
        console.warn('Logout request failed:', error);
      }
    }

    // Clear tokens regardless of API call success
    this.clearTokens();
  }

  // Make authenticated requests with automatic token refresh
  async authenticatedRequest(url: string, options: RequestInit = {}) {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    // First attempt with current token
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    // If token expired, try to refresh and retry
    if (response.status === 401) {
      try {
        await this.refreshAccessToken();
        
        // Retry with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${this.accessToken}`,
          },
        });
      } catch (refreshError) {
        throw new Error('Authentication failed, please login again');
      }
    }

    return response;
  }

  // Token management helpers
  private setTokens(tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    
    // Store in localStorage (consider more secure options for production)
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Check if user is logged in
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Export singleton instance
export const authService = new AuthService();
```

### Usage in React Components

```tsx
// LoginForm.tsx
import React, { useState } from 'react';
import { authService } from './auth.service';

export const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await authService.login(formData.username, formData.password);
      console.log('Logged in user:', user);
      // Redirect to dashboard or update app state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

### Making API Calls to Other Endpoints

```typescript
// recommendations.service.ts
import { authService } from './auth.service';

class RecommendationsService {
  private baseURL = 'http://localhost:3001/api';

  async getEventRecommendations(userId: number, limit = 10) {
    const response = await authService.authenticatedRequest(
      `${this.baseURL}/recommendations/events/${userId}?limit=${limit}`
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.recommendations;
    } else {
      throw new Error(data.message || 'Failed to get recommendations');
    }
  }

  async getUserProfile() {
    const response = await authService.authenticatedRequest(`${this.baseURL}/auth/me`);
    const data = await response.json();
    
    if (data.success) {
      return data.data.user;
    } else {
      throw new Error(data.message || 'Failed to get profile');
    }
  }
}

export const recommendationsService = new RecommendationsService();
```

---

## ⚠️ Important Security Notes

### **1. Token Storage**
- **Development:** localStorage is fine
- **Production:** Consider more secure options:
  - httpOnly cookies
  - Secure sessionStorage
  - In-memory storage with persistence strategy

### **2. HTTPS Only**
- Always use HTTPS in production
- Tokens transmitted over HTTP are vulnerable

### **3. Token Expiration**
- Access tokens expire in **15 minutes**
- Refresh tokens expire in **7 days**
- Implement automatic token refresh in your HTTP client

### **4. Error Handling**
- Always check `response.success` before using data
- Handle network errors gracefully
- Provide user-friendly error messages

---

## 🔧 Environment Configuration

### Development
```env
API_BASE_URL=http://localhost:3001
```

### Production
```env
API_BASE_URL=https://your-atlas-api.com
```

---

## 📋 Validation Rules

### Registration
- **Name:** 2-100 characters, letters/numbers/spaces/hyphens/underscores only
- **Username:** 3-30 characters, letters/numbers/hyphens/underscores only, unique
- **Email:** Valid email format, unique
- **Password:** Minimum 6 characters

### Rate Limits
- **Registration:** 5 attempts per 15 minutes per IP
- **Login:** 10 attempts per 15 minutes per IP
- **General API:** 1000 requests per 15 minutes per IP

---

## 🧪 Testing the API

### Using curl:

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get profile (replace TOKEN)
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/auth/me

# Refresh token
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"REFRESH_TOKEN"}'
```

---

## 🎯 Quick Integration Checklist

- [ ] Set up HTTP client with baseURL
- [ ] Implement token storage (localStorage/sessionStorage)
- [ ] Create login/register forms
- [ ] Add automatic token refresh logic
- [ ] Handle authentication errors gracefully
- [ ] Add loading states for auth operations
- [ ] Implement logout functionality
- [ ] Test with actual API endpoints
- [ ] Add error boundaries for auth failures
- [ ] Consider implementing auth context/state management

---

## 🚨 Common Issues & Solutions

### **Issue:** "Authentication required" on valid requests
**Solution:** Check that Authorization header is properly formatted: `Bearer <token>`

### **Issue:** Token refresh fails
**Solution:** Clear all tokens and redirect to login - refresh token may have expired

### **Issue:** CORS errors
**Solution:** API is configured for localhost:3000 and localhost:5173 - update your dev server port

### **Issue:** Registration fails with validation errors
**Solution:** Check that all required fields meet validation criteria

---

## 📞 Need Help?

If you run into issues:
1. Check browser network tab for actual API responses
2. Verify tokens are being stored and sent correctly
3. Test API endpoints with curl first
4. Check server logs for detailed error information

**The authentication system is fully functional and ready for frontend integration!** 🚀