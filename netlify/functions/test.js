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

  // Test environment variables
  const envVars = {
    BEE_CLIENT_ID: process.env.BEE_CLIENT_ID ? 'SET' : 'NOT SET',
    BEE_CLIENT_SECRET: process.env.BEE_CLIENT_SECRET ? 'SET' : 'NOT SET',
    CS_API_TOKEN: process.env.CS_API_TOKEN ? 'SET' : 'NOT SET',
    HTML_IMPORTER_API_KEY: process.env.HTML_IMPORTER_API_KEY ? 'SET' : 'NOT SET'
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Netlify Functions are working!',
      timestamp: new Date().toISOString(),
      environmentVariables: envVars,
      method: event.httpMethod,
      path: event.path
    })
  };
};
