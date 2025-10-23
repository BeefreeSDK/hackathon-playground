import './App.css';
import TemplateTopBar from './components/TemplateTopBar';
import BeefreeEditor from './components/BeefreeEditor';
import BeeConfigSidebar from './components/BeeConfigSidebar';
import ExportDropdown from './components/ExportDropdown';
import HtmlImportModal from './components/HtmlImportModal';
import { useState, useRef } from 'react';

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
    // This function will be called by the top bar, but the actual work
    // is done by the BeefreeEditor component via the exposed function
    if ((window as any).applyBrandStyles) {
      await (window as any).applyBrandStyles(brandStyles);
    } else {
      throw new Error('Editor not ready for brand styles');
    }
  };

  const handleConfigChange = async (newConfig: any) => {
    setBeeConfig(newConfig);
    // Restart the editor with new config
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
    if (!lastHtmlRef.current) {
      setError('Convert template to HTML first');
      return;
    }

    setLoadingState('image', true);
    setError('');

    try {
      const response = await fetch('/v1/message/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: lastHtmlRef.current,
          file_type: 'png',
          size: '1000'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
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

      // Load the imported JSON into the editor
      if (importedData && typeof importedData === 'object') {
        setCurrentJson(importedData);
        
        // Load into editor via the exposed function
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
    <div className="App">
      {/* Header with Beefree branding */}
      <header className="app-header">
        <div className="header-left">
          <div className="beefree-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16344 7.16344 0 16 0Z" fill="#8B5CF6"/>
              <path d="M8 8H24V24H8V8Z" fill="white"/>
              <path d="M10 10H22V22H10V10Z" fill="#8B5CF6"/>
              <path d="M12 12H20V20H12V12Z" fill="white"/>
            </svg>
            <span className="logo-text">beefree <span className="sdk-text">SDK</span></span>
          </div>
          <h1 className="page-title">SDK Playground</h1>
        </div>
        
        <div className="header-right">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="import-html-button"
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
            className="documentation-link"
          >
            Documentation
          </a>
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
                <span>Copy</span>
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
            <div className="result-section">
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
