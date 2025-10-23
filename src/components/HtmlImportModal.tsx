import { useState, useRef, useEffect } from 'react';

interface HtmlImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (html: string) => Promise<void>;
}

const HtmlImportModal: React.FC<HtmlImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus textarea when modal opens
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!htmlContent.trim()) {
      setError('Please enter HTML content to import');
      return;
    }

    setIsImporting(true);
    setError('');

    try {
      await onImport(htmlContent);
      setHtmlContent('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import HTML');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      setHtmlContent('');
      setError('');
      onClose();
    }
  };

  const loadSampleHtml = () => {
    const sampleHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sample Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center" style="background-color: #f4f4f4; padding: 40px 0;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px;">
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="color: #333333; font-size: 28px; margin: 0 0 20px 0;">Welcome to Our Newsletter</h1>
                            <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                                Thank you for subscribing! We're excited to share our latest updates with you.
                            </p>
                            <table cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="background-color: #7747FF; border-radius: 4px; padding: 12px 24px;">
                                        <a href="#" style="color: #ffffff; text-decoration: none; font-weight: bold;">Get Started</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    setHtmlContent(sampleHtml);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        <div className="modal-header">
          <h2>Import HTML Email</h2>
          <button 
            onClick={handleClose}
            disabled={isImporting}
            className="modal-close-button"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="import-instructions">
            <p>Paste your HTML email content below. The HTML will be processed and converted into a Beefree template.</p>
            <button 
              type="button" 
              onClick={loadSampleHtml}
              className="sample-button"
              disabled={isImporting}
            >
              Load Sample HTML
            </button>
          </div>

          <div className="html-input-container">
            <label htmlFor="html-content" className="input-label">
              HTML Content
            </label>
            <textarea
              ref={textareaRef}
              id="html-content"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Paste your HTML email content here..."
              className="html-textarea"
              disabled={isImporting}
            />
          </div>

          {error && (
            <div className="import-error">
              <span>{error}</span>
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={handleClose}
              disabled={isImporting}
              className="cancel-button"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isImporting || !htmlContent.trim()}
              className="import-button"
            >
              {isImporting ? 'Importing...' : 'Import HTML'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HtmlImportModal;
