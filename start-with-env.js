// Set environment variables and start proxy server
process.env.BEE_CLIENT_ID = '33868bf5-c9cf-44a9-a38b-4ccb0f942b50';
process.env.BEE_CLIENT_SECRET = 'OmDGGOgpU2Vo1e8Z5SkEH9slkGF2BuHl4v1gMvgequl6K5HZvyab';
process.env.CS_API_TOKEN = 'c5ef471afd10e8e7fafbcb39d5c3ce00a4c57d5a34c24e24eb6cbe81e365a45a';
process.env.PORT = '3001';

// Import and run the proxy server
import('./proxy-server.js');
