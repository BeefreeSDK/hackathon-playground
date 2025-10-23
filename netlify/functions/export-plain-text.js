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
    const { CS_API_TOKEN } = process.env;
    
    if (!CS_API_TOKEN) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Content Services API token not configured' })
      };
    }

    const { json } = JSON.parse(event.body || '{}');

    if (!json) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Template JSON is required' })
      };
    }

    // Export to Plain Text using Content Services API
    const response = await axios.post('https://content-services.beefree.io/v1/message/plain-text', {
      json: json
    }, {
      headers: {
        'Authorization': `Bearer ${CS_API_TOKEN}`,
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
    console.error('Plain text export error:', error.response?.data || error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to export plain text: ' + (error.response?.data?.message || error.message)
      })
    };
  }
};
