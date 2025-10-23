import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

// Import BeefreeSDK directly
import BeefreeSDK from '@beefree.io/sdk';

interface Template {
  id: string;
  name: string;
  title?: string;
  display_name?: string;
  json_data?: any;
  category?: string;
  collection?: string;
  designer?: string;
  tags?: string[];
  thumbnail?: string;
  data?: any;
}

interface BeefreeEditorProps {
  selectedTemplate: Template | null;
  onTemplateLoad: (templateData: any) => void;
  onApplyBrandStyles?: (brandStyles: any) => Promise<void>;
  onJsonChange?: (json: any) => void;
  beeConfig?: any;
  onConfigChange?: (config: any) => void;
}

const BeefreeEditor: React.FC<BeefreeEditorProps> = ({
  selectedTemplate,
  onTemplateLoad,
  onApplyBrandStyles,
  onJsonChange,
  beeConfig,
  onConfigChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const sdkRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [configChangeCounter, setConfigChangeCounter] = useState(0);

  // Normalize various API shapes to the JSON the SDK expects
  const normalizeTemplateJson = (input: any): any => {
    if (!input) return input;
    // Pride Month category templates have json_data property
    if (input.json_data) return input.json_data;
    // Brand styles API returns { html, json }
    if (input.json) return input.json;
    // Template catalog may return { template: {...} }
    if (input.template?.page) return input.template;
    if (input.template) return input.template;
    // Sometimes directly the page/rows structure
    if (input.page || input.rows) return input;
    return input;
  };

  // Apply brand styles using current editor content
  const applyBrandStyles = async (brandStyles: any) => {
    if (!sdkRef.current) {
      throw new Error('Editor not initialized');
    }

    try {
      // Get current JSON from the editor
      const editorResponse = await sdkRef.current.save();
      console.log('Editor save response:', editorResponse);
      console.log('Editor save response keys:', Object.keys(editorResponse));
      
      // The SDK might return different formats, let's handle all cases
      let templateJson;
      
      if (editorResponse.pageJson) {
        if (typeof editorResponse.pageJson === 'string') {
          // Parse JSON string
          try {
            templateJson = JSON.parse(editorResponse.pageJson);
            console.log('Parsed pageJson string to object');
          } catch (parseError) {
            console.error('Failed to parse pageJson string:', parseError);
            throw new Error('Invalid JSON format from editor');
          }
        } else {
          // Already an object
          templateJson = editorResponse.pageJson;
          console.log('Using pageJson object directly');
        }
      } else if (editorResponse.page) {
        // Direct page structure
        templateJson = editorResponse;
        console.log('Using editorResponse with page property');
      } else {
        // Check if the response itself is the template
        templateJson = editorResponse;
        console.log('Using editorResponse as template');
      }
      
      console.log('Final template JSON size:', JSON.stringify(templateJson).length);
      console.log('Final template structure:', Object.keys(templateJson));
      console.log('Has page property:', !!templateJson.page);
      
      // If we still don't have a page property, this might be the issue
      if (!templateJson.page) {
        console.error('Template is missing page property! Template keys:', Object.keys(templateJson));
        console.error('First level structure:', templateJson);
      }
      
      console.log('Sending to Brand Style API...');
      
      // Send to Brand Style API
      const response = await axios.post('/api/apply-brand-styles', {
        styles: brandStyles,
        template: templateJson
      });
      
      console.log('Brand styles applied, reloading editor with styled content...');
      
      // Load the styled JSON back into the editor
      const styledJson = normalizeTemplateJson(response.data);
      await sdkRef.current.load(styledJson);
      
      // Notify parent component
      onTemplateLoad(styledJson);
      
    } catch (error) {
      console.error('Failed to apply brand styles:', error);
      throw error;
    }
  };

  // Function to restart editor with new config
  const restartWithNewConfig = () => {
    setIsInitialized(false);
    setConfigChangeCounter(prev => prev + 1);
  };

  // Expose functions to parent
  useEffect(() => {
    if (onApplyBrandStyles) {
      // This is a bit of a hack, but we need to expose the function
      (window as any).applyBrandStyles = applyBrandStyles;
    }
    
    // Expose config restart function
    (window as any).restartEditor = restartWithNewConfig;
    
    // Expose template loading function
    (window as any).loadTemplate = async (templateData: any) => {
      if (sdkRef.current && isInitialized) {
        try {
          const normalizedData = normalizeTemplateJson(templateData);
          await sdkRef.current.load(normalizedData);
          onTemplateLoad(normalizedData);
          if (onJsonChange) {
            onJsonChange(normalizedData);
          }
        } catch (error) {
          console.error('Failed to load template:', error);
        }
      }
    };
  }, [onApplyBrandStyles, isInitialized]);

  // Initialize Beefree SDK
  useEffect(() => {
    let disposed = false;

    const initializeSDK = async () => {
      if (disposed || isInitialized) return;

      try {
        setLoading(true);
        setError('');

        // Get authentication token
        const authResponse = await axios.post('/api/proxy/bee-auth', {
          uid: 'demo-user'
        });

        if (disposed) return;

        const token = authResponse.data;

        // Initialize Beefree SDK
        const sdk = new BeefreeSDK({ ...token, v2: true });
        sdkRef.current = sdk;

        // Configure the editor with onChange tracking like playground
        const defaultBeeConfig = {
          container: 'beefree-react-demo',
          language: 'en-US',
          sidebarPosition: 'left',
          rowDisplayConditions: [
            {
              type: 'Last ordered catalog',
              label: 'new',
              description: 'Only new client will see this',
              before: '{% if lastOrder.catalog == "New" %}',
              after: '{% endif %}'
            }
          ],
          rowsConfiguration: {
            externalContentURLs: [
              {
                name: 'External resource',
                value: 'https://qa-bee-playground-backend.getbee.io/api/customrows?ids=1,2,3,4'
              }
            ]
          },
          mergeTags: [
            {
              name: 'first name',
              value: '[first-name]',
              previewValue: 'John'
            },
            {
              name: 'last name',
              value: '[last-name]',
              previewValue: 'Doe'
            },
            {
              name: 'email',
              value: '[email]',
              previewValue: 'john.doe@gmail.com'
            },
            {
              name: 'company',
              value: '[company]',
              previewValue: 'Company Srl'
            }
          ]
        };

        const finalBeeConfig = {
          ...(beeConfig || defaultBeeConfig),
          // Always override these callbacks
          onChange: (json: any) => {
            console.log('Template changed:', json);
            if (onJsonChange) {
              onJsonChange(json);
            }
            onTemplateLoad(json);
          },
          onSave: (pageJson: string, pageHtml: string, ampHtml: string | null, templateVersion: number, language: string | null) => {
            console.log('Saved!', { pageJson, pageHtml, ampHtml, templateVersion, language });
            const parsedJson = JSON.parse(pageJson);
            if (onJsonChange) {
              onJsonChange(parsedJson);
            }
            onTemplateLoad(parsedJson);
          },
          onError: (error: unknown) => {
            console.error('Error:', error);
            setError('Editor error: ' + (error as Error).message);
          }
        };

        // Notify parent of the current config
        if (onConfigChange && !beeConfig) {
          onConfigChange(defaultBeeConfig);
        }

        // Load initial template if available, otherwise start with empty
        let initialJson;
        try {
          const templateResponse = await fetch('/template.json');
          if (templateResponse.ok) {
            initialJson = await templateResponse.json();
            console.log('Loaded initial template from /template.json');
          }
        } catch (err) {
          console.log('No initial template found, starting empty');
        }

        // Start the editor
        await sdk.start(finalBeeConfig, initialJson, '', { shared: false });

        if (disposed) return;

        setIsInitialized(true);
        setLoading(false);

        // Callbacks already provided via beeConfig (onSave/onError)

      } catch (err: any) {
        if (disposed) return;
        console.error('Failed to initialize Beefree SDK:', err);
        // Do not surface blocking error UI; keep editor area clean per request
        setError('');
        setLoading(false);
      }
    };

    initializeSDK();

    return () => {
      disposed = true;
      if (sdkRef.current) {
        try {
          if (typeof sdkRef.current.destroy === 'function') {
            sdkRef.current.destroy();
          }
        } catch (err) {
          console.error('Error disposing SDK:', err);
        }
      }
    };
  }, [isInitialized, onTemplateLoad, configChangeCounter]);

  // Load template when selected
  useEffect(() => {
    const loadTemplate = async () => {
      if (!sdkRef.current || !selectedTemplate) return;

      try {
        setLoading(true);
        setError('');

        let templateData;

        // Check if template has json_data directly (from Pride Month category)
        if (selectedTemplate.json_data) {
          templateData = selectedTemplate.json_data;
        } else if (selectedTemplate.data?.json_data) {
          templateData = selectedTemplate.data.json_data;
        } else if (selectedTemplate.data) {
          // If the template has brand styles applied or other data, use that
          templateData = selectedTemplate.data;
        } else {
          // Fetch the template data from the API if not already loaded
          try {
            const response = await axios.get(`/api/templates/${selectedTemplate.id}`);
            templateData = response.data?.json_data || response.data;
          } catch (err) {
            console.error('Failed to fetch template data:', err);
            // Fallback to a basic template structure
            templateData = {
              page: {
                body: {
                  container: {
                    style: {
                      "background-color": "#fff"
                    }
                  },
                  content: {
                    computedStyle: {
                      linkColor: "#8a3b8f",
                      messageBackgroundColor: "transparent",
                      messageWidth: "650px"
                    },
                    style: {
                      color: "#000000",
                      "font-family": "Lato, Tahoma, Verdana, Segoe, sans-serif"
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
                        width: "500px"
                      }
                    },
                    columns: [
                      {
                        style: {
                          "background-color": "transparent",
                          "padding-bottom": "5px",
                          "padding-top": "5px"
                        },
                        modules: [
                          {
                            type: "mailup-bee-newsletter-modules-heading",
                            descriptor: {
                              heading: {
                                title: "h1",
                                text: selectedTemplate.name || "Template",
                                style: {
                                  color: "#555555",
                                  "font-size": "23px",
                                  "font-family": "inherit",
                                  "line-height": "120%",
                                  "text-align": "left",
                                  "font-weight": "700"
                                }
                              },
                              style: {
                                width: "100%",
                                "text-align": "center"
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
          }
        }

        // Load the template into the editor
        await sdkRef.current.load(normalizeTemplateJson(templateData));
        
        // Notify parent component
        onTemplateLoad(normalizeTemplateJson(templateData));
        
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to load template:', err);
        setError('Failed to load template: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };

    if (isInitialized && selectedTemplate) {
      loadTemplate();
    }
  }, [selectedTemplate, isInitialized, onTemplateLoad]);



  return (
    <div className="editor-container">
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>Loading...</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {selectedTemplate ? 'Loading template...' : 'Initializing editor...'}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          zIndex: 1000,
          background: '#ffebee',
          color: '#d32f2f',
          padding: '15px',
          borderRadius: '4px',
          border: '1px solid #ffcdd2'
        }}>
          <strong>Error:</strong> {error}
          <button 
            onClick={() => setError('')}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: '#d32f2f',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {!isInitialized && !loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#666',
          zIndex: 100,
          fontSize: '18px'
        }}>
          No-code email builder loading...
        </div>
      )}

      <div 
        id="beefree-react-demo" 
        ref={editorRef}
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }} 
      />
    </div>
  );
};

export default BeefreeEditor;
