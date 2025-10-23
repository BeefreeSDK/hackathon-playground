import { useState, useEffect } from 'react';

interface BeeConfigSidebarProps {
  onConfigChange: (config: any) => void;
  currentConfig: any;
}

const BeeConfigSidebar: React.FC<BeeConfigSidebarProps> = ({ onConfigChange, currentConfig }) => {
  const [configText, setConfigText] = useState('');
  const [error, setError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Initialize config text when currentConfig changes
  useEffect(() => {
    if (currentConfig) {
      setConfigText(JSON.stringify(currentConfig, null, 2));
    }
  }, [currentConfig]);

  const handleApplyChanges = async () => {
    setError('');
    setIsApplying(true);

    try {
      const parsedConfig = JSON.parse(configText);
      await onConfigChange(parsedConfig);
    } catch (err: any) {
      setError('Invalid JSON: ' + err.message);
    } finally {
      setIsApplying(false);
    }
  };

  const resetToDefault = () => {
    const defaultConfig = {
      container: 'beefree-react-demo',
      language: 'en-US',
      trackChanges: true,
      sidebarPosition: 'left',
      rowDisplayConditions: [
        {
          type: 'Last ordered',
          label: 'new',
          description: 'Only new client will see this.',
          before: '{% if lastOrder.catalog == "New" %}',
          after: '{% endif %}'
        }
      ],
      rowsConfiguration: {
        emptyRows: true,
        defaultRows: [
          {
            columns: [
              {
                grid: [12],
                modules: [
                  {
                    type: 'mailup-bee-newsletter-modules-paragraph',
                    descriptor: {
                      text: {
                        value: 'Drop your content here'
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
    
    setConfigText(JSON.stringify(defaultConfig, null, 2));
    setError('');
  };

  return (
    <div className="bee-config-sidebar">
      <div className="config-header">
        <h3>beeConfig</h3>
        <button 
          onClick={resetToDefault}
          className="reset-button"
          title="Reset to default configuration"
        >
          Reset
        </button>
      </div>
      
      <div className="config-editor">
        <textarea
          value={configText}
          onChange={(e) => setConfigText(e.target.value)}
          className="config-textarea"
          placeholder="Enter beeConfig JSON..."
          spellCheck={false}
        />
      </div>

      {error && (
        <div className="config-error">
          <span>{error}</span>
        </div>
      )}

      <div className="config-actions">
        <button 
          onClick={handleApplyChanges}
          disabled={isApplying || !configText.trim()}
          className="apply-button"
        >
          {isApplying ? 'Applying...' : 'Apply changes'}
        </button>
      </div>

      <div className="config-info">
        <p>Edit the beeConfig JSON above and click "Apply changes" to reload the builder with the new configuration.</p>
        <p>
          <a 
            href="https://docs.beefree.io/beefree-sdk/reference/sdk-configuration" 
            target="_blank" 
            rel="noreferrer"
            className="docs-link"
          >
            See documentation for available options
          </a>
        </p>
      </div>
    </div>
  );
};

export default BeeConfigSidebar;
