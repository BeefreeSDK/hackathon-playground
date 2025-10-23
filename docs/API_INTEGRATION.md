# API Integration Guide

This document provides detailed information about the API endpoints and authentication methods used in the Beefree SDK Template Catalog & Brand Styles application.

## Authentication

The application uses three different authentication methods:

### 1. Beefree SDK V2 Authentication
- **Endpoint**: `POST /api/bee-auth`
- **Purpose**: Get authentication token for the Beefree SDK editor
- **Credentials**: `BEE_CLIENT_ID` and `BEE_CLIENT_SECRET`

### 2. Template Catalog API Authentication
- **Method**: Bearer Token
- **Purpose**: Access template catalog endpoints
- **Credentials**: `TEMPLATE_CATALOG_API_TOKEN`

### 3. Brand Style Management API Authentication
- **Method**: Bearer Token
- **Purpose**: Apply brand styles to templates
- **Credentials**: `BRAND_STYLE_API_TOKEN`

## Template Catalog API

Base URL: `https://api.getbee.io/v1/catalog`

### Endpoints

#### Get Templates
```
GET /templates
```

**Query Parameters:**
- `category` (optional): Filter by category ID
- `collection` (optional): Filter by collection ID
- `designer` (optional): Filter by designer ID
- `tag` (optional): Filter by tag ID
- `limit` (optional): Number of templates to return (default: 20)
- `offset` (optional): Number of templates to skip (default: 0)

**Headers:**
```
Authorization: Bearer YOUR_TEMPLATE_CATALOG_API_TOKEN
Content-Type: application/json
```

#### Get Template by ID
```
GET /templates/{id}
```

**Headers:**
```
Authorization: Bearer YOUR_TEMPLATE_CATALOG_API_TOKEN
Content-Type: application/json
```

#### Get Categories
```
GET /categories
```

**Headers:**
```
Authorization: Bearer YOUR_TEMPLATE_CATALOG_API_TOKEN
Content-Type: application/json
```

#### Get Collections
```
GET /collections
```

**Headers:**
```
Authorization: Bearer YOUR_TEMPLATE_CATALOG_API_TOKEN
Content-Type: application/json
```

#### Get Designers
```
GET /designers
```

**Headers:**
```
Authorization: Bearer YOUR_TEMPLATE_CATALOG_API_TOKEN
Content-Type: application/json
```

#### Get Tags
```
GET /tags
```

**Headers:**
```
Authorization: Bearer YOUR_TEMPLATE_CATALOG_API_TOKEN
Content-Type: application/json
```

## Brand Style Management API

Base URL: `https://api.getbee.io/v1/template/brand`

### Apply Brand Styles
```
POST /brand
```

**Headers:**
```
Authorization: Bearer YOUR_BRAND_STYLE_API_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "styles": {
    "general": {
      "backgroundColor": "#FBF9FF",
      "contentAreaBackgroundColor": "#000000",
      "contentAreaWidth": "800px",
      "linkColor": "#82eda8",
      "defaultFont": "Inter,sans-serif",
      "color": "#26045d"
    },
    "button": {
      "styles": {
        "color": "#FBF9FF",
        "fontSize": "16px",
        "fontFamily": "Inter,sans-serif",
        "backgroundColor": "#7747ff",
        "borderBottom": "0px solid transparent",
        "borderLeft": "0px solid transparent",
        "borderRight": "0px solid transparent",
        "borderTop": "0px solid transparent",
        "borderRadius": "5px",
        "lineHeight": "120%",
        "maxWidth": "100%",
        "paddingBottom": "8px",
        "paddingLeft": "20px",
        "paddingRight": "20px",
        "paddingTop": "8px"
      },
      "blockOptions": {
        "paddingBottom": "20px",
        "paddingLeft": "20px",
        "paddingRight": "20px",
        "paddingTop": "20px",
        "align": "left",
        "hideContentOnMobile": true
      }
    }
  },
  "template": {
    // Template JSON data
  }
}
```

**Response:**
```json
{
  "html": "<!DOCTYPE html>...",
  "json": {
    // Updated template JSON with brand styles applied
  }
}
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Beefree SDK Credentials
BEE_CLIENT_ID='your-client-id'
BEE_CLIENT_SECRET='your-client-secret'

# Template Catalog API
TEMPLATE_CATALOG_API_URL='https://api.getbee.io/v1/catalog'
TEMPLATE_CATALOG_API_TOKEN='your-template-catalog-api-token'

# Brand Style Management API
BRAND_STYLE_API_URL='https://api.getbee.io/v1/template/brand'
BRAND_STYLE_API_TOKEN='your-brand-style-api-token'
```

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "error": "Invalid or missing authentication token"
}
```

#### 422 Unprocessable Entity (Brand Styles)
```json
{
  "status": "unchanged",
  "message": "No changes were needed for this template",
  "json": {
    // Original template data
  }
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to process request"
}
```

## Rate Limiting

Both APIs may have rate limiting in place. Implement appropriate retry logic and exponential backoff for production applications.

## Testing

You can test the API endpoints using tools like:
- Postman
- cURL
- Insomnia

### Example cURL Commands

#### Get Templates
```bash
curl -X GET "https://api.getbee.io/v1/catalog/templates" \
  -H "Authorization: Bearer YOUR_TEMPLATE_CATALOG_API_TOKEN" \
  -H "Content-Type: application/json"
```

#### Apply Brand Styles
```bash
curl -X POST "https://api.getbee.io/v1/template/brand" \
  -H "Authorization: Bearer YOUR_BRAND_STYLE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "styles": {
      "general": {
        "backgroundColor": "#FBF9FF",
        "contentAreaBackgroundColor": "#000000",
        "contentAreaWidth": "800px",
        "linkColor": "#82eda8",
        "defaultFont": "Inter,sans-serif",
        "color": "#26045d"
      }
    },
    "template": {
      // Your template JSON
    }
  }'
```

## Security Best Practices

1. **Never commit API tokens to version control**
2. **Use environment variables for sensitive data**
3. **Rotate API tokens regularly**
4. **Implement proper error handling**
5. **Use HTTPS for all API communications**
6. **Validate API responses before processing**

## Support

For API-related issues:
- Check the [Beefree SDK documentation](https://docs.beefree.io/beefree-sdk)
- Contact Beefree support for authentication issues
- Review the error responses for specific error details
