const axios = require('axios');

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (endpoint, params) => {
  return `${endpoint}-${JSON.stringify(params)}`;
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { BEE_CLIENT_ID, BEE_CLIENT_SECRET } = process.env;
    
    if (!BEE_CLIENT_ID || !BEE_CLIENT_SECRET) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Beefree credentials not configured' })
      };
    }

    // Parse query parameters
    const params = event.queryStringParameters || {};
    const templateId = event.path.split('/').pop();
    
    // Check if this is a request for a specific template
    if (templateId && templateId !== 'templates') {
      const cacheKey = getCacheKey('template', { id: templateId });
      const cached = getFromCache(cacheKey);
      if (cached) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(cached)
        };
      }

      // Get auth token first
      const authResponse = await axios.post('https://auth.beefree.io/authorize', {
        grant_type: 'client_credentials',
        client_id: BEE_CLIENT_ID,
        client_secret: BEE_CLIENT_SECRET,
        uid: 'demo-user'
      });

      const token = authResponse.data.access_token;

      // Fetch specific template
      const templateResponse = await axios.get(`https://template-catalog.beefree.io/v1/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setCache(cacheKey, templateResponse.data);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(templateResponse.data)
      };
    }

    // List templates
    const cacheKey = getCacheKey('templates', params);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(cached)
      };
    }

    // Get auth token first
    const authResponse = await axios.post('https://auth.beefree.io/authorize', {
      grant_type: 'client_credentials',
      client_id: BEE_CLIENT_ID,
      client_secret: BEE_CLIENT_SECRET,
      uid: 'demo-user'
    });

    const token = authResponse.data.access_token;

    // Fetch templates
    const templateResponse = await axios.get('https://template-catalog.beefree.io/v1/templates', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: params.limit || 50,
        offset: params.offset || 0,
        category: params.category,
        collection: params.collection,
        designer: params.designer,
        tag: params.tag
      }
    });

    setCache(cacheKey, templateResponse.data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(templateResponse.data)
    };
  } catch (error) {
    console.error('Templates error:', error.response?.data || error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch templates: ' + (error.response?.data?.message || error.message)
      })
    };
  }
};
