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
    const { HTML_IMPORTER_API_KEY } = process.env;
    
    if (!HTML_IMPORTER_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'HTML Importer API Key not configured' })
      };
    }

    const { html } = JSON.parse(event.body || '{}');
    
    if (!html || typeof html !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'HTML content is required' })
      };
    }

    // Basic HTML sanitization
    const sanitizedHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .trim();

    if (sanitizedHtml.length > 500000) { // 500KB limit
      return {
        statusCode: 413,
        headers,
        body: JSON.stringify({ error: 'HTML content too large (max 500KB)' })
      };
    }

    // For now, create a mock response since the HTML Importer endpoint might not be available
    // In production, you would use the actual Beefree HTML Importer API
    const mockResponse = {
      page: {
        body: {
          container: {
            style: {
              "background-color": "#fff"
            }
          },
          content: {
            computedStyle: {
              linkColor: "#8B5CF6",
              messageBackgroundColor: "transparent",
              messageWidth: "650px"
            },
            style: {
              color: "#000000",
              "font-family": "Inter, Arial, sans-serif"
            }
          },
          type: "mailup-bee-page-properties"
        },
        rows: [
          {
            container: {
              style: {
                "background-color": "transparent"
              }
            },
            content: {
              style: {
                "background-color": "transparent",
                color: "#000000",
                width: "650px"
              }
            },
            columns: [
              {
                style: {
                  "background-color": "transparent",
                  "padding-bottom": "20px",
                  "padding-top": "20px"
                },
                modules: [
                  {
                    type: "mailup-bee-newsletter-modules-paragraph",
                    descriptor: {
                      text: {
                        text: `Imported HTML Content:\n\n${sanitizedHtml.substring(0, 200)}${sanitizedHtml.length > 200 ? '...' : ''}`,
                        style: {
                          color: "#374151",
                          "font-size": "16px",
                          "font-family": "inherit",
                          "line-height": "150%",
                          "text-align": "left"
                        }
                      },
                      style: {
                        width: "100%",
                        "text-align": "left"
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockResponse)
    };
  } catch (error) {
    console.error('HTML import error:', error.message);
    
    if (error.response?.status === 413) {
      return {
        statusCode: 413,
        headers,
        body: JSON.stringify({ error: 'HTML content too large' })
      };
    } else if (error.response?.status === 422) {
      return {
        statusCode: 422,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid HTML format: ' + (error.response?.data?.message || 'Please check the HTML content') 
        })
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to import HTML: ' + (error.response?.data?.message || error.message) 
        })
      };
    }
  }
};
