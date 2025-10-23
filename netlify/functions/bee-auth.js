const axios = require('axios');

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

  if (event.httpMethod !== 'POST') {
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

    const { uid } = JSON.parse(event.body || '{}');

    const response = await axios.post('https://auth.beefree.io/authorize', {
      grant_type: 'client_credentials',
      client_id: BEE_CLIENT_ID,
      client_secret: BEE_CLIENT_SECRET,
      uid: uid || 'demo-user'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Auth error:', error.response?.data || error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Authentication failed: ' + (error.response?.data?.message || error.message)
      })
    };
  }
};
