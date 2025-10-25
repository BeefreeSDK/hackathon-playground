import { useState, useEffect } from 'react';
import axios from 'axios';
import { sampleBrandStyles } from '../config/brandStyles';

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

interface TemplateTopBarProps {
  onTemplateSelect: (template: Template) => void;
  selectedTemplate: Template | null;
  onApplyBrandStyles?: (brandStyles: any) => Promise<void>;
}

const TemplateTopBar: React.FC<TemplateTopBarProps> = ({ 
  onTemplateSelect, 
  selectedTemplate,
  onApplyBrandStyles
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch templates from the catalog on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch first 10 templates from the catalog as requested
      const response = await axios.get('/api/templates?limit=10');
      
      console.log('Templates API response:', response.data);
      
      // Handle different response structures for template lists
      let templatesArray: any[] = [];
      const data = response.data;
      
      if (Array.isArray(data)) {
        templatesArray = data;
      } else if (data?.results && Array.isArray(data.results)) {
        templatesArray = data.results;
      } else if (data?.templates && Array.isArray(data.templates)) {
        templatesArray = data.templates;
      } else if (data?.items && Array.isArray(data.items)) {
        templatesArray = data.items;
      } else if (data?.data && Array.isArray(data.data)) {
        templatesArray = data.data;
      }
      
      console.log('Raw API data structure:', data);
      console.log('Found templates array:', templatesArray.length, 'templates');
      
      // Process templates to ensure they have the structure we need
      // Limit to first 10 templates
      const processedTemplates = templatesArray
        .filter(template => template && (template.id || template.slug)) // Only include valid templates
        .slice(0, 10) // Limit to 10 templates
        .map((template, index) => ({
          id: template.id || template.slug || `template-${index}`,
          name: template.title || template.display_name || template.name || template.id || 'Untitled',
          display_name: template.title || template.display_name || template.name || template.id || 'Untitled',
          title: template.title,
          json_data: template.json_data,
          data: template
        }));
      
      setTemplates(processedTemplates);
      console.log('Processed templates (first 10):', processedTemplates.length);
      console.log('Template names:', processedTemplates.map(t => t.name));
    } catch (err) {
      setError('Failed to fetch templates');
      console.error('Error fetching templates:', err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBrandStyles = async () => {
    if (!selectedTemplate) {
      setError('Please select a template first');
      return;
    }

    if (!onApplyBrandStyles) {
      setError('Brand styles functionality not available');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Applying brand styles to current editor content...');
      console.log('Brand styles:', sampleBrandStyles);
      
      // Use the callback to apply brand styles with current editor content
      await onApplyBrandStyles(sampleBrandStyles);
      
      setError('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to apply brand styles';
      setError(errorMessage);
      console.error('Error applying brand styles:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="template-top-bar">
      <div className="top-bar-content">
        <div className="template-selection">
          <label htmlFor="template-select" className="template-label">
            Template:
          </label>
          {loading ? (
            <div className="loading-indicator">Loading templates...</div>
          ) : (
            <select
              id="template-select"
              className="template-select"
              value={selectedTemplate?.id || ''}
              onChange={async (e) => {
                const selectedId = e.target.value;
                const template = templates.find(t => t.id === selectedId);
                if (template) {
                  // If template already has json_data, use it directly
                  if (template.json_data) {
                    onTemplateSelect({
                      id: template.id,
                      name: template.display_name || template.name,
                      display_name: template.display_name,
                      json_data: template.json_data,
                      data: template
                    });
                  } else {
                    // Fetch full template details including json_data
                    try {
                      setLoading(true);
                      const response = await axios.get(`/api/templates/${selectedId}`);
                      const fullTemplate = response.data;
                      
                      onTemplateSelect({
                        id: template.id,
                        name: template.display_name || template.name,
                        display_name: template.display_name,
                        json_data: fullTemplate.json_data || fullTemplate,
                        data: fullTemplate
                      });
                    } catch (err) {
                      console.error('Failed to fetch template details:', err);
                      setError('Failed to load template');
                    } finally {
                      setLoading(false);
                    }
                  }
                }
              }}
            >
              <option value="">Choose a template...</option>
              {templates.map((template) => {
                const displayName = template.display_name || template.name || template.title || 'Untitled Template';
                return (
                  <option key={template.id} value={template.id}>
                    {displayName}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        <div className="template-actions">
          <button 
            className="brand-styles-button"
            onClick={handleApplyBrandStyles}
            disabled={loading || !selectedTemplate}
            title="Apply brand styles to the current template"
          >
            {loading ? 'Applying...' : 'Apply Brand Styles'}
          </button>
        </div>

        {selectedTemplate && (
          <div className="selected-template-info">
            <span className="template-name">{selectedTemplate.name}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="top-bar-error">
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            className="error-close"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateTopBar;
