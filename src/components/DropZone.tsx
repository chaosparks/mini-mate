import React, { useCallback, useState } from 'react';
import { SUPPORTED_EXTENSIONS } from '../constants';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  }, [onFilesAdded]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
    }
  }, [onFilesAdded]);

  const acceptedExtensions = [
    ...SUPPORTED_EXTENSIONS.JS, 
    ...SUPPORTED_EXTENSIONS.CSS, 
    ...SUPPORTED_EXTENSIONS.IMAGE
  ].join(',');

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-10 transition-all duration-300 ease-in-out text-center cursor-pointer group
        ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
      `}
    >
      <input
        type="file"
        multiple
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleInputChange}
        accept={acceptedExtensions}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
        <div className={`p-4 rounded-full bg-gray-100 transition-colors ${isDragOver ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'}`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-medium text-gray-700">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Support for JS, CSS, PNG, JPG
          </p>
        </div>
      </div>
    </div>
  );
};
