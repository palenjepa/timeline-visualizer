import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';
import './FileDropzone.css';

interface FileDropzoneProps {
  onDataLoaded: (data: any) => void;
  isLoading?: boolean;
}

export function FileDropzone({ onDataLoaded, isLoading = false }: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setError('Please upload a valid JSON file.');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        onDataLoaded(json);
      } catch (err) {
        console.error('JSON Parse Error:', err);
        setError('Unable to read this file.\n\nThe selected JSON is malformed or corrupted.');
      }
    };

    reader.onerror = () => {
      setError('Failed to read the file.');
    };

    reader.readAsText(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onClick = () => {
    fileInputRef.current?.click();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
      // Reset input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <div>
      <div 
        className={`dropzone-container ${isDragActive ? 'is-drag-active' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onClick}
      >
        <UploadCloud size={32} className="dropzone-icon" />
        <div className="dropzone-text">
          {isLoading ? 'Processing...' : 'Click or drag Timeline JSON here'}
        </div>
        <div className="dropzone-subtext">
          Processes locally. Your data never leaves your browser.
        </div>
        <input 
          type="file" 
          accept=".json,application/json" 
          ref={fileInputRef} 
          onChange={onChange} 
          style={{ display: 'none' }} 
        />
      </div>

      {error && (
        <div className="error-message animate-fade-in">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
        </div>
      )}
    </div>
  );
}
