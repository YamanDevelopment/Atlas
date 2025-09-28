#!/bin/bash

# Atlas Full Stack Startup Script
# Starts both backend and frontend development servers

echo "🎯 Starting Atlas Full Stack Development Environment"
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${BLUE}📍 Current directory: $(pwd)${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run this from the Atlas root directory.${NC}"
    exit 1
fi

# Install root dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
    npm install
fi

# Install frontend dependencies if needed
if [ ! -d "src/frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd src/frontend && npm install && cd ../..
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚙️  Creating .env file from template...${NC}"
    cat > .env << EOL
# Atlas Environment Configuration

# Database
MONGODB_URI=mongodb://localhost:27017
DB_NAME=atlas

# API Server
API_PORT=3001
NODE_ENV=development
HOST=localhost

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Authentication (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secure-jwt-secret-key-for-development-only-change-in-production
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_REGISTER_MAX=5
RATE_LIMIT_AUTH_MAX=10

# AI Configuration (Optional)
# GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
AI_ENABLE_AUTO_TAGGING=false
EOL
    echo -e "${GREEN}✅ .env file created. Please review and update the values as needed.${NC}"
fi

# Check if MongoDB is running
echo -e "${BLUE}🔍 Checking MongoDB connection...${NC}"
if ! mongo --eval "db.adminCommand('ping')" localhost:27017/test > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  MongoDB is not running on localhost:27017${NC}"
    echo -e "${YELLOW}   Please start MongoDB or update MONGODB_URI in .env${NC}"
else
    echo -e "${GREEN}✅ MongoDB is running${NC}"
fi

# Function to kill background processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
}

trap cleanup EXIT

# Start backend server
echo -e "${BLUE}🚀 Starting backend server on port 3001...${NC}"
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server is running${NC}"
else
    echo -e "${YELLOW}⚠️  Backend server might still be starting...${NC}"
fi

# Start frontend server
echo -e "${BLUE}🚀 Starting frontend server on port 3000...${NC}"
cd src/frontend && npm run dev &
FRONTEND_PID=$!
cd ../..

# Wait a moment for frontend to start
sleep 5

# Check if frontend is running
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend server is running${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend server might still be starting...${NC}"
fi

echo -e "\n${GREEN}🎉 Atlas Development Environment is ready!${NC}"
echo -e "${BLUE}📚 API Documentation: http://localhost:3001/api${NC}"
echo -e "${BLUE}💓 Health Check: http://localhost:3001/health${NC}"
echo -e "${BLUE}🎯 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}🔐 Backend API: http://localhost:3001/api${NC}"

echo -e "\n${YELLOW}📋 Available endpoints:${NC}"
echo "   GET  /health                    - API health check"
echo "   POST /api/auth/register         - User registration"
echo "   POST /api/auth/login            - User login"
echo "   GET  /api/auth/me               - Current user info"
echo "   GET  /api/events                - Get events"
echo "   GET  /api/organizations         - Get clubs/orgs"
echo "   GET  /api/recommendations/...   - Get recommendations"

echo -e "\n${BLUE}💡 Tips:${NC}"
echo "   - Press Ctrl+C to stop both servers"
echo "   - Backend logs will appear below"
echo "   - Frontend will open automatically in your browser"
echo "   - Check .env file for configuration options"

echo -e "\n${BLUE}🔧 Development servers are running...${NC}"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo -e "${YELLOW}   Press Ctrl+C to stop both servers${NC}"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID