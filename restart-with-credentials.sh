#!/bin/bash

# Kill existing processes
echo "Stopping existing servers..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 2

# Start proxy server with credentials
echo "Starting proxy server with credentials..."
BEE_CLIENT_ID=33868bf5-c9cf-44a9-a38b-4ccb0f942b50 \
BEE_CLIENT_SECRET=OmDGGOgpU2Vo1e8Z5SkEH9slkGF2BuHl4v1gMvgequl6K5HZvyab \
CS_API_TOKEN=c5ef471afd10e8e7fafbcb39d5c3ce00a4c57d5a34c24e24eb6cbe81e365a45a \
HTML_IMPORTER_API_KEY=c5ef471afd10e8e7fafbcb39d5c3ce00a4c57d5a34c24e24eb6cbe81e365a45a \
PORT=3001 \
node proxy-server.js &

# Wait for proxy server to start
sleep 3

# Start React dev server
echo "Starting React dev server..."
npm run dev &

echo "Servers starting..."
echo "Proxy server: http://localhost:3001"
echo "React app: http://localhost:5173"
echo ""
echo "Wait a few seconds and then open http://localhost:5173 in your browser"
