import './App.css';
import TemplateTopBar from './components/TemplateTopBar';
import BeefreeEditor from './components/BeefreeEditor';
import BeeConfigSidebar from './components/BeeConfigSidebar';
import ExportDropdown from './components/ExportDropdown';
import HtmlImportModal from './components/HtmlImportModal';
import { useState, useRef, useCallback } from 'react';

type ExportResult = {
  kind: 'html' | 'text' | 'image' | 'pdf';
  content: string;
  downloadUrl?: string;
}

function App() {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [currentJson, setCurrentJson] = useState<any>(null);
  const [beeConfig, setBeeConfig] = useState<any>(null);
  
  // Export states
  const [htmlResult, setHtmlResult] = useState<string>('');
  const [plainTextResult, setPlainTextResult] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string>('');
  
  // Import states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const lastHtmlRef = useRef<string | undefined>(undefined);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
  };

  const handleTemplateLoad = (templateData: any) => {
    setCurrentJson(templateData);
  };

  const handleJsonChange = (json: any) => {
    setCurrentJson(json);
  };

  const handleApplyBrandStyles = async (brandStyles: any) => {
    if ((window as any).applyBrandStyles) {
      await (window as any).applyBrandStyles(brandStyles);
    } else {
      throw new Error('Editor not ready for brand styles');
    }
  };

  const handleConfigChange = async (newConfig: any) => {
    setBeeConfig(newConfig);
    if ((window as any).restartEditor) {
      (window as any).restartEditor();
    }
  };

  const handleBeeConfigUpdate = (config: any) => {
    setBeeConfig(config);
  };

  const setLoadingState = (key: string, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const handleGetHtml = async () => {
    if (!currentJson) {
      setError('No template loaded. Please select a template first.');
      return;
    }

    setLoadingState('html', true);
    setError('');

    try {
      const response = await fetch('/v1/message/html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentJson),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      setHtmlResult(html);
      lastHtmlRef.current = html;
    } catch (err: any) {
      setError('Failed to export HTML: ' + err.message);
      console.error('HTML export error:', err);
    } finally {
      setLoadingState('html', false);
    }
  };

  const handleGetPlainText = async () => {
    if (!currentJson) {
      setError('No template loaded. Please select a template first.');
      return;
    }

    setLoadingState('plainText', true);
    setError('');

    try {
      const response = await fetch('/v1/message/plain-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentJson),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      setPlainTextResult(text);
    } catch (err: any) {
      setError('Failed to export plain text: ' + err.message);
      console.error('Plain text export error:', err);
    } finally {
      setLoadingState('plainText', false);
    }
  };

  const handleGetPdf = async () => {
    if (!lastHtmlRef.current) {
      setError('Convert template to HTML first');
      return;
    }

    setLoadingState('pdf', true);
    setError('');

    try {
      const response = await fetch('/v1/message/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: lastHtmlRef.current,
          page_size: 'Full',
          page_orientation: 'landscape'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setPdfUrl(data?.body?.url || '');
    } catch (err: any) {
      setError('Failed to export PDF: ' + err.message);
      console.error('PDF export error:', err);
    } finally {
      setLoadingState('pdf', false);
    }
  };

  const handleGetImage = async () => {
    setLoadingState('image', true);
    setError('');

    try {
      // First ensure we have HTML
      let html = lastHtmlRef.current;
      if (!html) {
        // Generate HTML first
        const htmlResponse = await fetch('/v1/message/html', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentJson),
        });

        if (!htmlResponse.ok) {
          throw new Error('Failed to generate HTML for image');
        }

        html = await htmlResponse.text();
        lastHtmlRef.current = html;
      }

      // Now generate the image with the exact parameters from the docs
      const response = await fetch('/v1/message/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_type: 'png',
          size: '1000',
          html: html
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Image export error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get the binary image data
      const blob = await response.blob();
      console.log('Image blob received:', blob.type, blob.size, 'bytes');
      
      // Create object URL for display
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (err: any) {
      setError('Failed to export image: ' + err.message);
      console.error('Image export error:', err);
    } finally {
      setLoadingState('image', false);
    }
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadImage = () => {
    if (imageUrl) {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = 'template-thumbnail.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleHtmlImport = async (html: string) => {
    setError('');

    try {
      const response = await fetch('/v1/html-importer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const importedData = await response.json();
      console.log('HTML imported successfully:', importedData);

      if (importedData && typeof importedData === 'object') {
        setCurrentJson(importedData);
        
        if ((window as any).loadTemplate) {
          (window as any).loadTemplate(importedData);
        }
      }
    } catch (err: any) {
      console.error('HTML import error:', err);
      throw new Error(err.message || 'Failed to import HTML');
    }
  };

  return (
    <div className="playground-container">
      {/* Header */}
      <header className="playground-header">
        <div className="header-content">
          <div className="header-left">
            <img 
              src="https://d15k2d11r6t6rl.cloudfront.net/pub/bfra/bs0kfqbg/tqu/rwx/rj4/Logo%20version%3DColored%2C%20Name%3DOn.svg" 
              alt="Beefree SDK" 
              className="logo"
            />
            <h1 className="playground-title">SDK Playground</h1>
          </div>
          <div className="header-right">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="btn-secondary"
            >
              Import HTML
            </button>
            <ExportDropdown 
              onExportHtml={handleGetHtml}
              onExportPlainText={handleGetPlainText}
              onExportImage={handleGetImage}
              onExportPdf={handleGetPdf}
              loading={loading}
            />
            <a 
              href="https://docs.beefree.io/beefree-sdk" 
              target="_blank" 
              rel="noreferrer"
              className="btn-secondary"
            >
              Documentation
            </a>
          </div>
        </div>
      </header>

      <TemplateTopBar 
        onTemplateSelect={handleTemplateSelect}
        selectedTemplate={selectedTemplate}
        onApplyBrandStyles={handleApplyBrandStyles}
      />

      {error && (
        <div className="global-error">
          <span>{error}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}
      
      <div className="main-content">
        {/* Left Panel - BeeConfig Editor */}
        <div className="config-sidebar">
          <BeeConfigSidebar 
            onConfigChange={handleConfigChange}
            currentConfig={beeConfig}
          />
        </div>

        {/* Center Panel - Beefree Editor */}
        <div className="editor-container">
          <BeefreeEditor 
            selectedTemplate={selectedTemplate}
            onTemplateLoad={handleTemplateLoad}
            onApplyBrandStyles={handleApplyBrandStyles}
            onJsonChange={handleJsonChange}
            beeConfig={beeConfig}
            onConfigChange={handleBeeConfigUpdate}
          />
        </div>
        
        {/* Right Panel - Export Results */}
        <div className="export-results-panel">
          <div className="export-preview-header">
            <h3>Export Preview</h3>
          </div>

          {htmlResult && (
            <div className="result-section">
              <div className="result-header">
                <span>HTML</span>
                <button onClick={() => downloadText(htmlResult, 'template.html')}>Download HTML</button>
              </div>
              <textarea 
                value={htmlResult} 
                readOnly 
                className="result-textarea"
                rows={12}
              />
            </div>
          )}

          {plainTextResult && (
            <div className="result-section">
              <div className="result-header">
                <span>Plain Text</span>
                <button onClick={() => downloadText(plainTextResult, 'template.txt')}>Download</button>
              </div>
              <textarea 
                value={plainTextResult} 
                readOnly 
                className="result-textarea"
                rows={8}
              />
            </div>
          )}

          {pdfUrl && (
            <div className="result-section">
              <div className="result-header">
                <span>PDF Result</span>
                <a href={pdfUrl} target="_blank" rel="noreferrer" className="pdf-link">
                  Open PDF
                </a>
              </div>
              <div className="pdf-info">
                PDF created. Use the link above to view or download.
              </div>
            </div>
          )}

          {imageUrl && (
            <div className="result-section image-section">
              <div className="result-header">
                <span>Thumbnail Image</span>
                <button onClick={downloadImage}>Download</button>
              </div>
              <div className="image-preview">
                <img src={imageUrl} alt="Template thumbnail" className="thumbnail-image" />
              </div>
            </div>
          )}

          {!htmlResult && !plainTextResult && !pdfUrl && !imageUrl && (
            <div className="no-results">
              Export results will appear here.
            </div>
          )}
        </div>
      </div>

      {/* HTML Import Modal */}
      <HtmlImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleHtmlImport}
      />
    </div>
  );
}

export default App;
