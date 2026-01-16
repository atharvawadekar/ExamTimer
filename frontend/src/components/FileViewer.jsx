import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FileViewer({ fileId, files, onClose, onNavigate }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (fileId && files.length > 0) {
      const index = files.findIndex(f => f.fileId === fileId);
      setCurrentIndex(index >= 0 ? index : 0);
      fetchFile(files[index >= 0 ? index : 0].fileId);
    }
  }, [fileId, files]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, files]);

  const fetchFile = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/files/stream/${id}`, {
        withCredentials: true
      });
      setFile(response.data);
      setError(null);
    } catch (err) {
      console.error('Fetch file error:', err);
      setError('Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < files.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextFileId = files[nextIndex].fileId;
      onNavigate(nextFileId);
      fetchFile(nextFileId);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      const prevFileId = files[prevIndex].fileId;
      onNavigate(prevFileId);
      fetchFile(prevFileId);
    }
  };

  if (!fileId || files.length === 0) return null;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        fontSize: '14px',
        color: '#999',
        backgroundColor: '#000'
      }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        color: '#c62828',
        backgroundColor: '#000'
      }}>
        {error}
      </div>
    );
  }

  if (!file) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>
          {file.fileType === 'pdf' ? '📄' : '🖼️'} {file.fileName}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#999' }}>
            {currentIndex + 1} / {files.length}
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: '#333',
              border: '1px solid #555',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            Exit (Esc)
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Left Arrow */}
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '12px 16px',
            fontSize: '24px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            color: '#fff',
            opacity: currentIndex === 0 ? 0.5 : 1,
            zIndex: 10
          }}
        >
          ←
        </button>

        {/* File Display */}
        {file.fileType === 'pdf' ? (
          <iframe
            src={file.data}
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            title={file.fileName}
          />
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            overflow: 'hidden'
          }}>
            <img
              src={file.data}
              alt={file.fileName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
        )}

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          disabled={currentIndex === files.length - 1}
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '12px 16px',
            fontSize: '24px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px',
            cursor: currentIndex === files.length - 1 ? 'not-allowed' : 'pointer',
            color: '#fff',
            opacity: currentIndex === files.length - 1 ? 0.5 : 1,
            zIndex: 10
          }}
        >
          →
        </button>
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#1a1a1a',
        borderTop: '1px solid #333',
        fontSize: '12px',
        color: '#999',
        textAlign: 'center'
      }}>
        Use arrow keys to navigate, ESC to exit
      </div>
    </div>
  );
}
