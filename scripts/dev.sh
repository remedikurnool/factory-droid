#!/bin/bash

# Development Server Startup Script
# Starts Frontend (3000) and Admin (3001) in development mode

echo "🚀 Starting ONE MEDI Development Servers..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

# Check frontend dependencies
if [ ! -d "apps/frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd apps/frontend && npm install && cd ../..
fi

# Check admin dependencies  
if [ ! -d "apps/admin/node_modules" ]; then
    echo "📦 Installing admin dependencies..."
    cd apps/admin && npm install && cd ../..
fi

echo ""
echo "✨ Starting servers..."
echo "   Frontend: http://localhost:3000"
echo "   Admin: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start both servers with concurrently
npm run dev
