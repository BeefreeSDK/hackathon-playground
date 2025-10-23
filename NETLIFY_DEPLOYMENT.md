# Netlify Deployment Guide

## 🚀 Quick Setup

### 1. Environment Variables in Netlify

Go to your Netlify site dashboard → **Site settings** → **Environment variables** and add:

```
BEE_CLIENT_ID=33868bf5-c9cf-44a9-a38b-4ccb0f942b50
BEE_CLIENT_SECRET=OmDGGOgpU2Vo1e8Z5SkEH9slkGF2BuHl4v1gMvgequl6K5HZvyab
CS_API_TOKEN=c5ef471afd10e8e7fafbcb39d5c3ce00a4c57d5a34c24e24eb6cbe81e365a45a
HTML_IMPORTER_API_KEY=c5ef471afd10e8e7fafbcb39d5c3ce00a4c57d5a34c24e24eb6cbe81e365a45a
```

### 2. Deploy Settings

**Build settings:**
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions` (auto-detected)

### 3. What's Included

✅ **Netlify Functions** (replaces your local proxy server):
- `/.netlify/functions/bee-auth` - Beefree authentication
- `/.netlify/functions/templates` - Template catalog API
- `/.netlify/functions/apply-brand-styles` - Brand styles API
- `/.netlify/functions/export-html` - HTML export
- `/.netlify/functions/export-plain-text` - Plain text export
- `/.netlify/functions/export-pdf` - PDF export
- `/.netlify/functions/export-image` - Image export
- `/.netlify/functions/html-importer` - HTML import

✅ **Automatic redirects** configured in `netlify.toml`
✅ **CORS headers** enabled for all functions
✅ **Caching** implemented for better performance
✅ **Error handling** with proper HTTP status codes

## 🔧 How It Works

1. **Frontend calls** `/api/templates` → **Netlify redirects** to `/.netlify/functions/templates`
2. **Functions authenticate** with Beefree APIs using your environment variables
3. **Results cached** for 5 minutes to improve performance
4. **CORS enabled** so your frontend can access the functions

## 📝 Deployment Steps

1. **Push your code** to GitHub/GitLab
2. **Connect repository** to Netlify
3. **Add environment variables** (step 1 above)
4. **Deploy!** 🎉

## 🐛 Troubleshooting

### Function Logs
Check **Functions** tab in Netlify dashboard for error logs.

### Common Issues
- **401 Unauthorized**: Check environment variables are set correctly
- **CORS errors**: Functions include proper CORS headers
- **Timeout**: Functions have 30-second timeout for API calls

### Testing Functions Locally
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run local development with functions
netlify dev
```

## 🔄 Alternative: Environment Detection

Your app will automatically work with:
- **Local development**: Uses `localhost:3001` proxy server
- **Production**: Uses Netlify Functions

No code changes needed! The redirects in `netlify.toml` handle everything.

## 📊 Performance Notes

- **Caching**: Template catalog cached for 5 minutes
- **Cold starts**: First function call may be slower (~1-2 seconds)
- **Concurrent requests**: Netlify Functions auto-scale

Your Beefree SDK playground is now production-ready! 🚀
