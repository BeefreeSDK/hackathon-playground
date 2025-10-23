#!/bin/bash

# Beefree SDK Template Catalog & Brand Styles Setup Script

echo "🚀 Setting up Beefree SDK Template Catalog & Brand Styles..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your Beefree SDK credentials"
    echo "   - BEE_CLIENT_ID"
    echo "   - BEE_CLIENT_SECRET"
    echo "   - TEMPLATE_CATALOG_API_TOKEN"
    echo "   - BRAND_STYLE_API_TOKEN"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Beefree SDK credentials"
echo "2. Start the proxy server: npm run proxy"
echo "3. In another terminal, start the React app: npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "For more information, see README.md"
