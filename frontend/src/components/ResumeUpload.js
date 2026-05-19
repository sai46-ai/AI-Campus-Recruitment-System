import React, { useState, useRef } from 'react';
import api from '../services/api';
import './ResumeUpload.css';

const ResumeUpload = ({ currentResume, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [hiddenLocally, setHiddenLocally] = useState(false); 
  const fileInputRef = useRef(null);

  const allowedTypes = ['application/pdf'];
  const allowedExtensions = ['.pdf'];

  const validateFile = (file) => {
    if (!file) return 'Please select a file';
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(ext) && !allowedTypes.includes(file.type)) {
      return 'Only PDF files (.pdf) are allowed';
    }
    if (file.size > 2 * 1024 * 1024) return 'File size must be less than 2MB';
    return null;
  };

  const handleUpload = async (file) => {
    const validationError = validateFile(file);
    if (validationError) { setError(validationError); return; }

    setError(''); setSuccess(''); setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      // POST request to your updated Node.js endpoint
      const res = await api.post('/api/auth/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Extract the new resume object containing AI analysis from the response
      const newResume = res.data?.data?.resume || res.data?.resume;

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.resume = newResume;
      localStorage.setItem('user', JSON.stringify(storedUser));

      setSuccess('Resume uploaded and analyzed by AI!');
      setHiddenLocally(false);
      if (onUploadSuccess) onUploadSuccess(newResume);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to upload resume');
    } finally { setUploading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    setError(''); setSuccess(''); setUploading(true);
    try {
      await api.delete('/api/auth/resume');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      delete storedUser.resume;
      localStorage.setItem('user', JSON.stringify(storedUser));
      setSuccess('Resume deleted successfully!');
      setHiddenLocally(true);
      if (onUploadSuccess) onUploadSuccess(null);
    } catch (err) { setError('Failed to delete resume'); } finally { setUploading(false); }
  };

  // Original UI Handlers preserved
  const handleFileChange = (e) => { const file = e.target.files[0]; if (file) handleUpload(file); };
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === 'dragenter' || e.type === 'dragover'); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0]); };
  const handleClick = (e) => { if (e.target.type !== 'file' && fileInputRef.current) { fileInputRef.current.click(); } };
  const formatDate = (dateString) => { if (!dateString) return ''; return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); };

  return (
    <div className="resume-upload-container">
      <h3 className="resume-upload-title">
        {/* Original SVG Icon preserved */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" />
        </svg>
        AI-Powered Resume
      </h3>

      {currentResume?.originalName && !hiddenLocally && (
        <div className="resume-card-wrapper">
          <div className="current-resume">
            <div className="resume-file-info">
              {/* Original SVG Icon preserved */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" />
              </svg>
              <div className="resume-details">
                <span className="resume-name">{currentResume.originalName}</span>
                <span className="resume-date">Uploaded {formatDate(currentResume.uploadedAt)}</span>
              </div>
            </div>
            {/* Original delete handler with logic preserved */}
            <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="delete-btn-icon">🗑️</button>
          </div>

          {/* INTEGRATED AI DISPLAY */}
          {currentResume.extractedSkills?.length > 0 && (
            <div className="ai-results-container">
              <div className="match-score-pill">AI Profile Score: {currentResume.matchScore}%</div>
              <p className="ai-skills-label">Verified Skills:</p>
              <div className="skill-badge-group">
                {currentResume.extractedSkills.map((skill, idx) => (
                  <span key={idx} className="ai-skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Original Drag and Drop Zone preserved with updated text */}
      <div
        className={`upload-dropzone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={handleClick}
      >
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} style={{display: 'none'}} />
        {uploading ? (
          <div className="upload-progress">
            <div className="spinner"></div>
            <p>AI Engine Analyzing Resume...</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">☁️</div>
            <p className="upload-text">Drag & drop to replace your resume</p>
            <button className="browse-btn" onClick={(e) => e.stopPropagation()}>Select PDF</button>
            <p className="upload-hint">PDF only (max 2MB)</p>
          </>
        )}
      </div>

      {error && (
        <div className="upload-message error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="upload-message success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
          {success}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;