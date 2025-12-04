import React from 'react';
import { ProcessedFile, FileStatus, FileType } from '../types';

interface FileItemProps {
  item: ProcessedFile;
  onDownload: (id: string) => void;
  onRemove: (id: string) => void;
  onToggleWebP: (id: string) => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const FileItem: React.FC<FileItemProps> = ({ item, onDownload, onRemove, onToggleWebP }) => {
  const isImage = item.type === FileType.IMAGE;
  const isPending = item.status === FileStatus.PENDING;
  
  const getIcon = () => {
    if (item.type === FileType.JS) return <span className="text-yellow-500 font-bold text-xs border border-yellow-500 px-1 rounded">JS</span>;
    if (item.type === FileType.CSS) return <span className="text-blue-500 font-bold text-xs border border-blue-500 px-1 rounded">CSS</span>;
    return (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
  };

  const getStatusBadge = () => {
    switch(item.status) {
      case FileStatus.PENDING:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Pending</span>;
      case FileStatus.PROCESSING:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
             <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            Processing
          </span>
        );
      case FileStatus.COMPLETED:
        const savings = item.result ? Math.round(((item.result.originalSize - item.result.newSize) / item.result.originalSize) * 100) : 0;
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Done (-{savings}%)</span>;
      case FileStatus.ERROR:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Failed</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
            {getIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate" title={item.file.name}>
              {item.file.name}
            </p>
            <p className="text-xs text-gray-500">
               {formatBytes(item.file.size)}
               {item.result && ` → ${formatBytes(item.result.newSize)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Options for Image */}
          {isImage && isPending && (
             <label className="flex items-center space-x-2 cursor-pointer select-none">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" 
                    checked={item.options?.convertToWebP || false}
                    onChange={() => onToggleWebP(item.id)}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
                <span className="text-xs text-gray-600 font-medium">WebP</span>
             </label>
          )}

          <div className="flex flex-col items-end space-y-1">
            {getStatusBadge()}
            {item.status === FileStatus.ERROR && (
                <span className="text-xs text-red-500 max-w-[150px] truncate" title={item.error}>{item.error}</span>
            )}
          </div>

          <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
             {item.status === FileStatus.COMPLETED ? (
                <button
                  onClick={() => onDownload(item.id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  title="Download"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
             ) : (
                <div className="w-9 h-9"></div> // Spacer
             )}
            
            <button
              onClick={() => onRemove(item.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Remove"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
