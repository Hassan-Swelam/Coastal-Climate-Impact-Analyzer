import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFile, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const FileUploadComponent = ({ onFileUploaded, onError }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const validateFile = (file) => {
    const fileName = file.name.toLowerCase();
    const isValidExtension = fileName.endsWith('.csv') || 
                           fileName.endsWith('.geojson') || 
                           fileName.endsWith('.json');
    
    if (!isValidExtension) {
      setUploadStatus({ 
        type: 'error', 
        message: 'Please upload only CSV or GeoJSON files' 
      });
      return false;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setUploadStatus({ 
        type: 'error', 
        message: 'File size must be less than 50MB' 
      });
      return false;
    }
    
    return true;
  };

  const handleFile = async (file) => {
    if (!validateFile(file)) return;

    setUploading(true);
    setUploadStatus({ type: 'info', message: 'Uploading file...' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'geojson');

      // Send to your backend
      const response = await axios.post("http://localhost:5000/upload_layer", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        setUploadStatus({ 
          type: 'success', 
          message: 'File uploaded successfully!' 
        });
        
        // Pass the uploaded file data to parent component
        if (onFileUploaded) {
          onFileUploaded({
            fileName: file.name,
            fileType: file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'geojson',
            data: response.data.data,
            filePath: response.data.filePath,
            layerInfo: response.data.layerInfo
          });
        }

        // Auto-close dialog after success
        setTimeout(() => {
          setShowUploadDialog(false);
          setUploadStatus(null);
        }, 2000);
      }

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || 'Upload failed';
      setUploadStatus({ type: 'error', message: errorMessage });
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const toggleUploadDialog = () => {
    setShowUploadDialog(!showUploadDialog);
    if (!showUploadDialog) {
      setUploadStatus(null);
    }
  };

  return (
    <>
      {/* Upload Button */}
      <button 
        onClick={toggleUploadDialog}
        className="upload-layer-btn"
        title="Upload Layer"
      >
        <FontAwesomeIcon icon={faUpload} />
      </button>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="upload-dialog-overlay">
          <div className="upload-dialog">
            <div className="upload-dialog-header">
              <h3>Upload Layer</h3>
              <button 
                onClick={toggleUploadDialog}
                className="close-dialog-btn"
              >
                ×
              </button>
            </div>

            <div className="upload-dialog-content">
              <div
                className={`upload-drop-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv,.geojson,.json"
                  onChange={handleInputChange}
                  className="upload-input"
                  disabled={uploading}
                />
                
                <div className="upload-content">
                  <FontAwesomeIcon icon={faFile} className="upload-icon" />
                  <p className="upload-text">
                    {dragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="upload-subtext">
                    Supported: CSV, GeoJSON (max 50MB)
                  </p>
                </div>
              </div>

              {uploadStatus && (
                <div className={`upload-status ${uploadStatus.type}`}>
                  <FontAwesomeIcon 
                    icon={uploadStatus.type === 'error' ? faExclamationTriangle : faCheck} 
                  />
                  <span>{uploadStatus.message}</span>
                </div>
              )}

              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileUploadComponent;