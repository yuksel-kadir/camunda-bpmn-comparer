import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IconFile, IconUpload } from './Icons';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';

interface FileUploaderProps {
  onFileLoad: (file: { name: string; content: string; path?: string }) => void;
  title: string;
  variant?: 'default' | 'compact';
  accept?: string;
  fileName?: string | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileLoad,
  title,
  variant = 'default',
  accept = '.bpmn',
  fileName
}) => {
  const { t } = useTranslation();
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const displayFileName = fileName !== undefined ? fileName : localFileName;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (fileName === undefined) {
        setLocalFileName(file.name);
      }
      onFileLoad({ name: file.name, content });
    };
    reader.readAsText(file);
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [onFileLoad]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.bpmn')) {
      processFile(file);
    }
  };

  const triggerNativeDialog = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'BPMN Files',
          extensions: ['bpmn']
        }]
      });

      if (selected && typeof selected === 'string') {
        const content = await readTextFile(selected);
        const name = selected.split(/[\\/]/).pop() || 'file.bpmn';

        if (fileName === undefined) {
          setLocalFileName(name);
        }
        onFileLoad({ name, content, path: selected });
      }
    } catch (e) {
      console.error('Failed to open native dialog', e);
      // Fallback to hidden input if needed, but in Tauri we prefer native
      fileInputRef.current?.click();
    }
  };

  const triggerFileInput = () => {
    // If we are in Tauri, we can use the native dialog
    // We check window.__TAURI_INTERNALS__ or just try catch
    if (window && (window as any).__TAURI_INTERNALS__) {
      triggerNativeDialog();
    } else {
      fileInputRef.current?.click();
    }
  };

  if (variant === 'compact') {
    return (
      <div className="file-uploader-compact">
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept={accept}
          onChange={handleFileChange}
        />
        <button
          onClick={triggerFileInput}
          className="btn-secondary"
          title={fileName || title}
        >
          <IconUpload className="icon-sm" />
          <span className="text-ellipsis">
            {displayFileName ? displayFileName : title}
          </span>
        </button>
      </div>
    );
  }

  // Default Dropzone
  return (
    <div>
      <h3 className="text-header mb-sm">{title}</h3>
      <label
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className="dropzone"
      >
        <div className="dropzone-content">
          <IconUpload className="dropzone-icon" />
          <div className="dropzone-text">
            <span className="dropzone-link">
              <span>{t('uploader.uploadAFile')}</span>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept={accept}
                onChange={handleFileChange}
              />
            </span>
            <p>{t('uploader.orDragAndDrop')}</p>
          </div>
          <p className="text-label">{t('uploader.bpmnOnly')}</p>
          {displayFileName && (
            <div className="file-loaded-indicator">
              <IconFile className="icon-md" />
              <span>{displayFileName}</span>
            </div>
          )}
        </div>
      </label>
    </div>
  );
};
