import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, File as FileIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const { t } = useLanguage();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDrop as any,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.d83', '.x83', '.p83', '.txt', '.xml'],
      'application/xml': ['.x83', '.xml']
    },
    multiple: false,
    disabled: isLoading
  } as any);

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
        ${isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100">
          <UploadCloud className="w-10 h-10 text-blue-500" />
        </div>
        <div>
          <p className="text-lg font-medium text-slate-700">
            {isDragActive ? t.upload.dropzoneActive : t.upload.dropzoneTitle}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {t.upload.dropzoneSubtitle}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-6 text-sm text-slate-400">
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            <span>PDF</span>
          </div>
          <div className="flex items-center">
            <FileIcon className="w-4 h-4 mr-1" />
            <span>GAEB (XML/Text)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
