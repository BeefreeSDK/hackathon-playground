# Beefree SDK React Demo with Content Services API Exports

<!-- Trigger redeploy with environment variables -->

This project embeds Beefree SDK's no‑code email builder in a React (Vite + TypeScript) app and adds four export actions powered by the Content Services API: HTML, Plain Text, PDF, and Thumbnail Image. The builder uses LoginV2 server‑side authentication and tracks live changes via onChange. The export result panel appears on the left with copy/download controls; the editor is on the right.

**New Features:**

* ✅ **Responsive Design**: Auto-adjusts to different screen sizes
* ✅ **Performance Optimized**: Smart caching, debouncing, and parallel API calls
* ✅ **Enhanced Loading**: Clean loading states with "No-code email builder loading..." message
* ✅ **Template Loading**: Loads custom template.json from the project root
* ✅ **Advanced Configuration**: Pre-configured merge tags, row display conditions, and external content URLs
* ✅ **Error Handling**: Better error messages and retry functionality
* ✅ **Template Catalog Integration**: Browse and select templates from the top bar
* ✅ **Brand Style Management**: Apply custom brand styles to templates

## Features

### 🎨 Template Catalog Integration
- **Browse Templates**: Access the complete template catalog from the top navigation bar
- **Template Selection**: Easy dropdown selection of available templates
- **Template Loading**: Seamless loading of selected templates into the editor
- **Template Details**: View selected template information

### 🎯 Brand Style Management
- **Pre-defined Brand Styles**: Apply consistent brand styling across templates
- **One-Click Application**: Apply brand styles with a single button click
- **Real-time Preview**: See brand style previews in the sidebar
- **Style Validation**: Ensures brand styles conform to Beefree SDK specifications

### 📤 Export Functionality
- **HTML Export**: Convert designs to clean HTML code
- **Plain Text Export**: Extract plain text content from designs
- **PDF Export**: Generate PDF documents from designs
- **Thumbnail Export**: Create PNG thumbnail images
- **Copy/Download**: Easy copy to clipboard and download functionality

### 🖥️ User Interface
- **Responsive Layout**: Export panel on left, editor on right, template selection on top
- **Modern Design**: Clean, intuitive interface matching the playground style
- **Loading States**: Clear feedback with "No-code email builder loading..." message
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Project Structure

```
template-catalog-brand-styles/
├── public/
│   └── template.json              # Initial template for the editor
├── src/
│   ├── components/
│   │   ├── BeefreeEditor.tsx      # Main editor component with onChange tracking
│   │   ├── TemplateTopBar.tsx     # Template selection top bar
│   │   └── ExportPanel.tsx        # Export functionality panel
│   ├── config/
│   │   └── brandStyles.ts         # Brand style configurations
│   ├── services/
│   │   └── api.ts                 # API service layer
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── App.tsx                    # Main application component
│   ├── App.css                    # Application styles
│   ├── index.css                  # Global styles
│   └── main.tsx                   # Application entry point
├── proxy-server.js                # Backend proxy server with export endpoints
├── package.json                   # Dependencies and scripts
├── vite.config.ts                 # Vite configuration with proxy setup
├── tsconfig.json                  # TypeScript configuration
├── env.example                    # Environment variables template
└── README.md                      # Project documentation
```

## Prerequisites

Before running this project, you'll need:

1. **Node.js** (v20 or higher)
2. **npm** or **yarn**
3. **Beefree SDK Account** with access to:
   - Template Catalog API
   - Content Services API (for exports and Brand Style Management)
   - Client ID and Client Secret

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd template-catalog-brand-styles
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
       Edit the `.env` file with your Beefree SDK credentials:
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
    
    # Content Services API (for exports)
    CS_API_TOKEN='your-cs-api-token'
    
    # Server Port
    PORT=3001
    ```

## Running the Application

The application requires two processes to run:

### 1. Start the Proxy Server
```bash
npm run dev:proxy
```
This starts the backend proxy server on `http://localhost:3001` that handles:
- Beefree SDK authentication (LoginV2)
- Template Catalog API requests
- Brand Style Management API requests
- Content Services API export requests (HTML, Plain Text, PDF, Image)

### 2. Start the React Application
```bash
npm run dev
```
This starts the React development server on `http://localhost:5173`

### 3. Access the Application
Open your browser and navigate to `http://localhost:5173`

## Usage

### Selecting Templates

1. **Browse Available Templates**: The top navigation bar displays a dropdown with all available templates from the catalog
2. **Select a Template**: Choose a template from the dropdown list
3. **View Template Details**: Selected template information is displayed in the top bar
4. **Template Loading**: The selected template automatically loads into the editor

### Applying Brand Styles

1. **Select a Template**: Choose a template from the catalog dropdown
2. **Apply Brand Styles**: Click the "Apply Brand Styles" button in the top bar
3. **View Results**: The template loads in the editor with brand styles applied
4. **Real-time Updates**: Changes are tracked automatically via onChange

### Using Export Features

1. **Get HTML**: Click "Get HTML" to export the current design as HTML code
2. **Get Plain Text**: Click "Get Plain Text" to extract plain text content
3. **Get Thumbnail Image**: Click "Get Thumbnail Image" to generate a PNG preview (requires HTML first)
4. **Get PDF**: Click "Get PDF" to generate a PDF document (requires HTML first)
5. **Copy/Download**: Use the copy and download buttons in the export results panel

### Brand Style Configuration

The application includes a sample brand style configuration that applies:
- **Primary Color**: #7747ff (purple)
- **Background Color**: #FBF9FF (light purple)
- **Text Color**: #26045d (dark purple)
- **Font Family**: Inter, sans-serif
- **Button Style**: Purple background, light text
- **Content Width**: 800px

You can customize these styles by modifying the `sampleBrandStyles` object in `src/config/brandStyles.ts`.

## API Integration

### Template Catalog API

The application integrates with the following Template Catalog API endpoints:

- `GET https://api.getbee.io/v1/catalog/templates` - List templates with optional filters
- `GET https://api.getbee.io/v1/catalog/templates/:id` - Get specific template details
- `GET https://api.getbee.io/v1/catalog/categories` - List all categories
- `GET https://api.getbee.io/v1/catalog/collections` - List all collections
- `GET https://api.getbee.io/v1/catalog/designers` - List all designers
- `GET https://api.getbee.io/v1/catalog/tags` - List all tags

### Brand Style Management API

The application uses the Brand Style Management API to apply custom styles:

- `POST https://api.getbee.io/v1/template/brand` - Apply brand styles to a template

### Content Services API

The application uses the Content Services API for export functionality:

- `POST https://api.getbee.io/v1/message/html` - Export design as HTML
- `POST https://api.getbee.io/v1/message/plain-text` - Export design as plain text
- `POST https://api.getbee.io/v1/message/pdf` - Export design as PDF
- `POST https://api.getbee.io/v1/message/image` - Export design as thumbnail image

### Authentication

The application uses multiple authentication methods:
- **Beefree SDK V2**: `POST /bee-auth` - Get authentication token for the editor
- **Template Catalog API**: Bearer token authentication for template access
- **Brand Style Management API**: Bearer token authentication for style application

## Customization

### Adding New Brand Styles

To add new brand styles, modify the `sampleBrandStyles` object in `src/components/TemplateSidebar.tsx`:

```typescript
const sampleBrandStyles = {
  styles: {
    // Add your custom styles here
    customElement: {
      color: "#your-color",
      fontSize: "16px",
      // ... other properties
    }
  }
};
```

### Modifying Template Filters

To add new filter options, update the filter state and UI in `src/components/TemplateSidebar.tsx`.

### Customizing the Editor

To customize the Beefree SDK editor configuration, modify the `beeConfig` object in `src/components/BeefreeEditor.tsx`.

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify your `BEE_CLIENT_ID` and `BEE_CLIENT_SECRET` are correct
   - Ensure your Beefree SDK account has the necessary permissions

2. **Template Loading Issues**
   - Check that the Template Catalog API is accessible
   - Verify your API endpoints are correctly configured

3. **Brand Styles Not Applying**
   - Ensure your `BRAND_STYLE_API_TOKEN` is configured
   - Check that the brand styles object conforms to the validation schema

4. **Proxy Server Issues**
   - Make sure the proxy server is running on port 3001
   - Check that the React app is configured to proxy to the correct URL

### Debug Mode

Enable debug logging by adding `console.log` statements or using browser developer tools to inspect API responses and errors.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run proxy` - Start proxy server
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **React Hooks** for state management

### Testing

To add tests, create test files with the `.test.ts` or `.test.tsx` extension and run:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues related to:
- **Beefree SDK**: Contact Beefree support
- **Template Catalog API**: Refer to the [Beefree SDK documentation](https://docs.beefree.io/beefree-sdk/apis/template-catalog-api)
- **Brand Style Management**: Refer to the [Brand Style Management documentation](https://docs.beefree.io/beefree-sdk/apis/content-services-api/brand-style-management)

## Acknowledgments

- [Beefree SDK](https://docs.beefree.io/beefree-sdk) for providing the email builder and APIs
- [React](https://reactjs.org/) for the UI framework
- [Vite](https://vitejs.dev/) for the build tool
- [TypeScript](https://www.typescriptlang.org/) for type safety
