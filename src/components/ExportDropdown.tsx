import { useState, useRef, useEffect } from 'react';

interface ExportDropdownProps {
  onExportHtml: () => void;
  onExportPlainText: () => void;
  onExportImage: () => void;
  onExportPdf: () => void;
  loading: { [key: string]: boolean };
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExportHtml,
  onExportPlainText,
  onExportImage,
  onExportPdf,
  loading
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExportAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <div className="export-dropdown" ref={dropdownRef}>
      <button 
        className="export-dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isAnyLoading}
      >
        <span>Export</span>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="none"
        >
          <path 
            d="M3 4.5L6 7.5L9 4.5" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="export-dropdown-menu">
          <button 
            className="export-dropdown-item"
            onClick={() => handleExportAction(onExportHtml)}
            disabled={loading.html}
          >
            <span>HTML</span>
            {loading.html && <span className="loading-spinner">⟳</span>}
          </button>
          
          <button 
            className="export-dropdown-item"
            onClick={() => handleExportAction(onExportPlainText)}
            disabled={loading.plainText}
          >
            <span>Plain Text</span>
            {loading.plainText && <span className="loading-spinner">⟳</span>}
          </button>
          
          <button 
            className="export-dropdown-item"
            onClick={() => handleExportAction(onExportImage)}
            disabled={loading.image}
          >
            <span>Thumbnail Image</span>
            {loading.image && <span className="loading-spinner">⟳</span>}
          </button>
          
          <button 
            className="export-dropdown-item"
            onClick={() => handleExportAction(onExportPdf)}
            disabled={loading.pdf}
          >
            <span>PDF</span>
            {loading.pdf && <span className="loading-spinner">⟳</span>}
          </button>
          
          <div className="dropdown-divider"></div>
          
          <a 
            href="https://docs.beefree.io/beefree-sdk/apis/content-services-api/export" 
            target="_blank" 
            rel="noreferrer"
            className="export-dropdown-item docs-item"
          >
            <span>Documentation</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path 
                d="M9 3L3 9M9 3H5M9 3V7" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
