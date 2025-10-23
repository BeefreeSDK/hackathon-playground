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

    const { styles, template } = JSON.parse(event.body || '{}');

    if (!styles || !template) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Styles and template are required' })
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

    // Apply brand styles
    const response = await axios.post('https://brand-style-management.beefree.io/v1/apply', {
      styles: styles,
      template: template,
      html: ''
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Brand styles error:', error.response?.data || error.message);
    
    if (error.response?.status === 422) {
      return {
        statusCode: 422,
        headers,
        body: JSON.stringify({ 
          error: 'Brand styles could not be applied: ' + (error.response?.data?.message || 'Invalid template format')
        })
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to apply brand styles: ' + (error.response?.data?.message || error.message)
      })
    };
  }
};
