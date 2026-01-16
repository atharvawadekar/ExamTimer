import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function FileManager({ onFileSelect, selectedFileId, onFilesUpdate }) {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  // Notify parent component when files change
  useEffect(() => {
    if (onFilesUpdate) {
      onFilesUpdate(files);
    }
  }, [files, onFilesUpdate]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/files`, {
        withCredentials: true
      });
      console.log('Files fetched:', response.data.files); // Debug log
      setFiles(response.data.files || []);
      setError(null);
    } catch (err) {
      console.error('Fetch files error:', err);
      setError('Failed to load files');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Only PDF and image files are allowed');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large (max 50MB)');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/files/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        await fetchFiles();
        event.target.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Delete this file?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/files/${fileId}`, {
        withCredentials: true
      });

      await fetchFiles();
      if (selectedFileId === fileId) {
        onFileSelect(null);
      }
      setError(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Delete failed');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '12px', marginTop: '12px' }}>
      <span className="sidebar-label">Exam Files</span>

      <label style={{
        display: 'block',
        padding: '8px',
        marginTop: '8px',
        borderRadius: '6px',
        border: files.length >= 5 ? '1px solid #ddd' : '1px dashed #007bff',
        backgroundColor: files.length >= 5 ? '#f5f5f5' : '#f0f7ff',
        color: files.length >= 5 ? '#999' : '#007bff',
        fontSize: '12px',
        cursor: files.length >= 5 ? 'not-allowed' : 'pointer',
        textAlign: 'center',
        fontWeight: '500'
      }}>
        {uploading ? 'Uploading...' : files.length >= 5 ? 'Limit Reached (5/5)' : '+ Upload PDF/Image'}
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.gif"
          onChange={handleFileUpload}
          disabled={uploading || files.length >= 5}
          style={{ display: 'none' }}
        />
      </label>

      {error && (
        <div style={{
          marginTop: '8px',
          padding: '6px 8px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          fontSize: '11px'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '8px', maxHeight: '150px', overflowY: 'auto' }}>
        {files.length === 0 ? (
          <div style={{ fontSize: '11px', color: '#999', padding: '8px' }}>No files uploaded</div>
        ) : (
          files.map(file => (
            <div
              key={file.fileId}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
                marginBottom: '4px',
                backgroundColor: selectedFileId === file.fileId ? '#e3f2fd' : '#f5f5f5',
                borderRadius: '4px',
                border: selectedFileId === file.fileId ? '1px solid #007bff' : '1px solid #ddd',
                cursor: 'pointer',
                gap: '6px'
              }}
              onClick={() => onFileSelect(file.fileId)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {file.fileType === 'pdf' ? '📄' : '🖼️'} {file.fileName}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(file.fileId);
                }}
                style={{
                  padding: '2px 6px',
                  fontSize: '10px',
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
