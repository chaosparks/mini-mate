import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DropZone } from './components/DropZone';
import { FileItem } from './components/FileItem';
import { FileStatus, FileType, ProcessedFile } from './types';
import { minifyCodeLocally } from './services/minificationService';
import { compressImage } from './services/imageService';

const App: React.FC = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);

  const determineType = (file: File): FileType => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.js')) return FileType.JS;
    if (name.endsWith('.css')) return FileType.CSS;
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) return FileType.IMAGE;
    return FileType.UNKNOWN;
  };

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const processedFiles: ProcessedFile[] = newFiles
      .filter(file => determineType(file) !== FileType.UNKNOWN)
      .map(file => ({
        id: uuidv4(),
        file,
        status: FileStatus.PENDING,
        type: determineType(file),
        progress: 0,
        options: { convertToWebP: false } // Default option
      }));

    setFiles(prev => [...prev, ...processedFiles]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleToggleWebP = useCallback((id: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id && f.type === FileType.IMAGE) {
        return {
            ...f,
            options: { ...f.options, convertToWebP: !f.options?.convertToWebP }
        };
      }
      return f;
    }));
  }, []);

  const handleProcess = async () => {
    setGlobalLoading(true);
    const pendingFiles = files.filter(f => f.status === FileStatus.PENDING || f.status === FileStatus.ERROR);

    await Promise.all(pendingFiles.map(async (item) => {
        // Update status to processing
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: FileStatus.PROCESSING, error: undefined } : f));

        try {
            if (item.type === FileType.JS || item.type === FileType.CSS) {
                // Read text content
                const text = await item.file.text();
                // Use local library minification
                const minifiedCode = await minifyCodeLocally(text, item.type as 'JS' | 'CSS');
                
                // Create blob
                const blob = new Blob([minifiedCode], { type: 'text/plain' });
                const extension = item.type === FileType.JS ? '.min.js' : '.min.css';
                const originalName = item.file.name;
                const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
                const newName = `${baseName}${extension}`;

                setFiles(prev => prev.map(f => f.id === item.id ? {
                    ...f,
                    status: FileStatus.COMPLETED,
                    result: {
                        blob,
                        fileName: newName,
                        originalSize: item.file.size,
                        newSize: blob.size
                    }
                } : f));

            } else if (item.type === FileType.IMAGE) {
                const result = await compressImage(item.file, item.options?.convertToWebP);
                setFiles(prev => prev.map(f => f.id === item.id ? {
                    ...f,
                    status: FileStatus.COMPLETED,
                    result: {
                        blob: result.blob,
                        fileName: result.fileName,
                        originalSize: item.file.size,
                        newSize: result.blob.size
                    }
                } : f));
            }
        } catch (err: any) {
            setFiles(prev => prev.map(f => f.id === item.id ? {
                ...f,
                status: FileStatus.ERROR,
                error: err.message || "Unknown error occurred"
            } : f));
        }
    }));

    setGlobalLoading(false);
  };

  const handleDownload = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file && file.result) {
        const url = URL.createObjectURL(file.result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.result.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
  };

  const pendingCount = files.filter(f => f.status === FileStatus.PENDING || f.status === FileStatus.ERROR).length;
  const processingCount = files.filter(f => f.status === FileStatus.PROCESSING).length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                M
             </div>
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                MiniMate
             </h1>
          </div>
          <div className="text-sm text-gray-500">
             100% Local & Secure
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Intro */}
        <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Optimize your assets locally
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Minify JavaScript and CSS using industry-standard libraries. Compress PNGs and JPGs, or convert them to WebP directly in your browser.
            </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
                <DropZone onFilesAdded={handleFilesAdded} />
            </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Files ({files.length})</h3>
                    {(pendingCount > 0 || processingCount > 0) && (
                         <button
                         onClick={handleProcess}
                         disabled={globalLoading}
                         className={`
                           px-6 py-2 rounded-lg font-medium shadow-sm text-white transition-all
                           ${globalLoading 
                             ? 'bg-indigo-400 cursor-not-allowed' 
                             : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-lg active:transform active:scale-95'
                           }
                         `}
                       >
                         {globalLoading ? 'Processing...' : `Process ${pendingCount} File${pendingCount !== 1 ? 's' : ''}`}
                       </button>
                    )}
                </div>

                <div className="space-y-3">
                    {files.map(file => (
                        <FileItem 
                            key={file.id} 
                            item={file} 
                            onDownload={handleDownload}
                            onRemove={handleRemove}
                            onToggleWebP={handleToggleWebP}
                        />
                    ))}
                </div>
            </div>
        )}

        {/* Features Grid */}
        {files.length === 0 && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 mb-4">
                        <span className="font-bold">JS</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">JavaScript</h4>
                    <p className="text-sm text-gray-500 mt-2">Powered by Terser. Mangling and compression running locally.</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                        <span className="font-bold">CSS</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">CSS</h4>
                    <p className="text-sm text-gray-500 mt-2">Powered by CSSO. Structural optimization for stylesheets.</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h4 className="font-semibold text-gray-900">Images</h4>
                    <p className="text-sm text-gray-500 mt-2">Compress PNG/JPG or convert to WebP using browser canvas.</p>
                </div>
             </div>
        )}
      </main>
    </div>
  );
};

export default App;