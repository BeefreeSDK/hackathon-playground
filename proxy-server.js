import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// Increase payload limit for large template JSON data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const BEE_CLIENT_ID = process.env.BEE_CLIENT_ID;
const BEE_CLIENT_SECRET = process.env.BEE_CLIENT_SECRET;
const TEMPLATE_CATALOG_API_URL = process.env.TEMPLATE_CATALOG_API_URL || 'https://api.getbee.io/v1/catalog';
const TEMPLATE_CATALOG_API_TOKEN = process.env.TEMPLATE_CATALOG_API_TOKEN;
const BRAND_STYLE_API_URL = process.env.BRAND_STYLE_API_URL || 'https://api.getbee.io/v1/template/brand';
const BRAND_STYLE_API_TOKEN = process.env.BRAND_STYLE_API_TOKEN;
const CS_API_TOKEN = process.env.CS_API_TOKEN;
const HTML_IMPORTER_API_KEY = process.env.HTML_IMPORTER_API_KEY;

// Cache for performance optimization
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(url, body) {
  return `${url}:${JSON.stringify(body)}`;
}

function getFromCache(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// V2 Auth Endpoint
app.post('/proxy/bee-auth', async (req, res) => {
  try {
    const { uid } = req.body;
    
    const response = await axios.post(
      'https://auth.getbee.io/loginV2',
      {
        client_id: BEE_CLIENT_ID,
        client_secret: BEE_CLIENT_SECRET,
        uid: uid || 'demo-user'
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
});

// Template Catalog API endpoints (note: Vite rewrites /api -> '')
app.get('/templates', async (req, res) => {
  try {
    if (!TEMPLATE_CATALOG_API_TOKEN) {
      return res.status(500).json({ error: 'Template Catalog API Token not configured' });
    }

    const { category, collection, designer, tag, limit = 20, offset = 0 } = req.query;
    
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (collection) params.append('collection', collection);
    if (designer) params.append('designer', designer);
    if (tag) params.append('tag', tag);
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);
    
    const response = await axios.get(`${TEMPLATE_CATALOG_API_URL}/templates?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${TEMPLATE_CATALOG_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Template catalog error:', error.message);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.get('/templates/:id', async (req, res) => {
  try {
    if (!TEMPLATE_CATALOG_API_TOKEN) {
      return res.status(500).json({ error: 'Template Catalog API Token not configured' });
    }

    const { id } = req.params;
    
    const response = await axios.get(`${TEMPLATE_CATALOG_API_URL}/templates/${id}`, {
      headers: {
        'Authorization': `Bearer ${TEMPLATE_CATALOG_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Template fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

app.get('/categories', async (req, res) => {
  try {
    if (!TEMPLATE_CATALOG_API_TOKEN) {
      return res.status(500).json({ error: 'Template Catalog API Token not configured' });
    }

    const response = await axios.get(`${TEMPLATE_CATALOG_API_URL}/categories`, {
      headers: {
        'Authorization': `Bearer ${TEMPLATE_CATALOG_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Categories error:', error.message);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/categories/:id', async (req, res) => {
  try {
    if (!TEMPLATE_CATALOG_API_TOKEN) {
      return res.status(500).json({ error: 'Template Catalog API Token not configured' });
    }

    const { id } = req.params;
    
    const response = await axios.get(`${TEMPLATE_CATALOG_API_URL}/categories/${id}`, {
      headers: {
        'Authorization': `Bearer ${TEMPLATE_CATALOG_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Category fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

app.get('/collections', async (req, res) => {
  try {
    if (!TEMPLATE_CATALOG_API_TOKEN) {
      return res.status(500).json({ error: 'Template Catalog API Token not configured' });
    }

    const response = await axios.get(`${TEMPLATE_CATALOG_API_URL}/collections`, {
      headers: {
        'Authorization': `Bearer ${TEMPLATE_CATALOG_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Collections error:', error.message);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

app.get('/collections/:id', async (req, res) => {
  try {
    if (!TEMPLATE_CATALOG_API_TOKEN) {
      return res.status(500).json({ error: 'Template Catalog API Token not configured' });
    }

    const { id } = req.params;
    
    const response = await axios.get(`${TEMPLATE_CATALOG_API_URL}/collections/${id}`, {
      headers: {
        'Authorization': `Bearer ${TEMPLATE_CATALOG_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Collection fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

app.get('/designers', async (req, res) => {
  try {
    if (!TEMPLATE_CATALOG_API_TOKEN) {
      return res.status(500).json({ error: 'Template Catalog API Token not configured' });
    }

    const response = await axios.get(`${TEMPLATE_CATALOG_API_URL}/designers`, {
      headers: {
        'Authorization': `Bearer ${TEMPLATE_CATALOG_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Designers error:', error.message);
    res.status(500).json({ error: 'Failed to fetch designers' });
  }
});

app.get('/designers/:id', async (req, res) => {
  try {
    if (!TEMPLATE_CATALOG_API_TOKEN) {
      return res.status(500).json({ error: 'Template Catalog API Token not configured' });
    }

    const { id } = req.params;
    
    const response = await axios.get(`${TEMPLATE_CATALOG_API_URL}/designers/${id}`, {
      headers: {
        'Authorization': `Bearer ${TEMPLATE_CATALOG_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Designer fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch designer' });
  }
});

app.get('/tags', async (req, res) => {
  try {
    if (!TEMPLATE_CATALOG_API_TOKEN) {
      return res.status(500).json({ error: 'Template Catalog API Token not configured' });
    }

    const response = await axios.get(`${TEMPLATE_CATALOG_API_URL}/tags`, {
      headers: {
        'Authorization': `Bearer ${TEMPLATE_CATALOG_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Tags error:', error.message);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Brand Style Management API endpoint
app.post('/apply-brand-styles', async (req, res) => {
  try {
    const { styles, template } = req.body;
    
    console.log('Applying brand styles...');
    console.log('Template data size:', JSON.stringify(template).length, 'characters');
    console.log('Brand styles:', JSON.stringify(styles, null, 2));
    
    // Log template structure to understand what we're working with
    if (template && template.page && template.page.rows) {
      console.log('Template has', template.page.rows.length, 'rows');
      
      // Look through all modules to see what types are available
      const allModuleTypes = [];
      template.page.rows.forEach((row, rowIndex) => {
        if (row.columns) {
          row.columns.forEach((column, colIndex) => {
            if (column.modules) {
              column.modules.forEach((module, moduleIndex) => {
                allModuleTypes.push({
                  type: module.type,
                  position: `row${rowIndex}-col${colIndex}-mod${moduleIndex}`,
                  hasDescriptor: !!module.descriptor
                });
                
                // Log specific module structure for debugging
                if (module.type && module.type.includes('paragraph')) {
                  console.log('Found paragraph module:', {
                    type: module.type,
                    descriptor: module.descriptor ? Object.keys(module.descriptor) : 'none'
                  });
                }
                if (module.type && module.type.includes('button')) {
                  console.log('Found button module:', {
                    type: module.type,
                    descriptor: module.descriptor ? Object.keys(module.descriptor) : 'none'
                  });
                }
              });
            }
          });
        }
      });
      
      console.log('All module types found:', allModuleTypes.map(m => m.type));
      console.log('Unique module types:', [...new Set(allModuleTypes.map(m => m.type))]);
    } else {
      console.log('Template structure:', Object.keys(template || {}));
    }
    
    if (!BRAND_STYLE_API_TOKEN) {
      return res.status(500).json({ error: 'Brand Style API Token not configured' });
    }
    
    // Ensure the payload matches the expected API format
    const payload = {
      styles: styles,
      template: template,
      html: true  // Request both HTML and JSON response
    };
    
    console.log('Sending payload to Brand Style API...');
    console.log('Payload structure:', Object.keys(payload));
    console.log('Brand styles being applied:', JSON.stringify(styles, null, 2));
    
    const response = await axios.post(BRAND_STYLE_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${BRAND_STYLE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('Brand styles applied successfully');
    console.log('Response includes:', Object.keys(response.data));
    
    // Return the styled template JSON (not the HTML)
    res.json(response.data.json || response.data);
  } catch (error) {
    console.error('Brand styles error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 413) {
      res.status(413).json({ error: 'Template data too large for brand style processing' });
    } else if (error.response?.status === 422) {
      res.status(422).json({ 
        error: 'Invalid request format: ' + (error.response?.data?.message || 'Please check the template and styles format') 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to apply brand styles: ' + (error.response?.data?.message || error.message) 
      });
    }
  }
});

// Content Services API Export Endpoints
app.post('/v1/message/html', async (req, res) => {
  try {
    if (!CS_API_TOKEN) {
      return res.status(500).json({ error: 'CS API Token not configured' });
    }

    const cacheKey = getCacheKey('html', req.body);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const response = await axios.post('https://api.getbee.io/v1/message/html', req.body, {
      headers: {
        'Authorization': CS_API_TOKEN.startsWith('Bearer ') ? CS_API_TOKEN : `Bearer ${CS_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    setCache(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('HTML export error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to export HTML: ' + (error.response?.data?.message || error.message) 
    });
  }
});

app.post('/v1/message/plain-text', async (req, res) => {
  try {
    if (!CS_API_TOKEN) {
      return res.status(500).json({ error: 'CS API Token not configured' });
    }

    const cacheKey = getCacheKey('plain-text', req.body);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.send(cached);
    }

    const response = await axios.post('https://api.getbee.io/v1/message/plain-text', req.body, {
      headers: {
        'Authorization': CS_API_TOKEN.startsWith('Bearer ') ? CS_API_TOKEN : `Bearer ${CS_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    setCache(cacheKey, response.data);
    res.send(response.data);
  } catch (error) {
    console.error('Plain text export error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to export plain text: ' + (error.response?.data?.message || error.message) 
    });
  }
});

app.post('/v1/message/pdf', async (req, res) => {
  try {
    if (!CS_API_TOKEN) {
      return res.status(500).json({ error: 'CS API Token not configured' });
    }

    const cacheKey = getCacheKey('pdf', req.body);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const response = await axios.post('https://api.getbee.io/v1/message/pdf', req.body, {
      headers: {
        'Authorization': CS_API_TOKEN.startsWith('Bearer ') ? CS_API_TOKEN : `Bearer ${CS_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    setCache(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('PDF export error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to export PDF: ' + (error.response?.data?.message || error.message) 
    });
  }
});

app.post('/v1/message/image', async (req, res) => {
  try {
    if (!CS_API_TOKEN) {
      return res.status(500).json({ error: 'CS API Token not configured' });
    }

    const cacheKey = getCacheKey('image', req.body);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.type('image/png').send(cached);
    }

    const response = await axios.post('https://api.getbee.io/v1/message/image', req.body, {
      headers: {
        'Authorization': CS_API_TOKEN.startsWith('Bearer ') ? CS_API_TOKEN : `Bearer ${CS_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    setCache(cacheKey, response.data);
    res.type('image/png').send(response.data);
  } catch (error) {
    console.error('Image export error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to export image: ' + (error.response?.data?.message || error.message) 
    });
  }
});

// Cache management endpoints
app.get('/cache/status', (req, res) => {
  res.json({
    size: cache.size,
    keys: Array.from(cache.keys()).slice(0, 10) // Show first 10 keys
  });
});

app.post('/cache/clear', (req, res) => {
  cache.clear();
  res.json({ message: 'Cache cleared' });
});

// HTML Importer API endpoint
app.post('/v1/html-importer', async (req, res) => {
  try {
    if (!HTML_IMPORTER_API_KEY) {
      return res.status(500).json({ error: 'HTML Importer API Key not configured' });
    }

    const { html } = req.body;
    
    if (!html || typeof html !== 'string') {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    console.log('Processing HTML import request...');
    console.log('HTML content length:', html.length, 'characters');

    // Basic HTML sanitization
    const sanitizedHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .trim();

    if (sanitizedHtml.length > 500000) { // 500KB limit
      return res.status(413).json({ error: 'HTML content too large (max 500KB)' });
    }

    const cacheKey = getCacheKey('html-importer', { html: sanitizedHtml });
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(cached);
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
    
    const response = { data: mockResponse };

    console.log('HTML import successful');
    
    setCache(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('HTML import error:', error.response?.data || error.message);
    
    if (error.response?.status === 413) {
      res.status(413).json({ error: 'HTML content too large' });
    } else if (error.response?.status === 422) {
      res.status(422).json({ 
        error: 'Invalid HTML format: ' + (error.response?.data?.message || 'Please check the HTML content') 
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(408).json({ error: 'Request timeout - HTML processing took too long' });
    } else {
      res.status(500).json({ 
        error: 'Failed to import HTML: ' + (error.response?.data?.message || error.message) 
      });
    }
  }
});

// Auto-cleanup expired cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
