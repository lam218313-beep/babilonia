import { Upload, FileText, Check, X, Calendar, Tag } from 'lucide-react';
import { useState } from 'react';

interface PendingFile {
  id: string;
  name: string;
  size: number;
  category: string;
  code: string;
  year: string;
  status: 'pending' | 'processing' | 'ready';
}

export default function Ingestion() {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([
    {
      id: '1',
      name: 'RNE_E030_2023_Actualizado.pdf',
      size: 4.2 * 1024 * 1024,
      category: 'B: Regulatory',
      code: 'E.030',
      year: '2023',
      status: 'ready',
    },
    {
      id: '2',
      name: 'Especificaciones_Tecnicas_HVAC.pdf',
      size: 2.8 * 1024 * 1024,
      category: 'C: Specs',
      code: 'HVAC-001',
      year: '2024',
      status: 'pending',
    },
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePublish = (id: string) => {
    setPendingFiles(files => files.filter(f => f.id !== id));
  };

  const handleRemove = (id: string) => {
    setPendingFiles(files => files.filter(f => f.id !== id));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-1">Document Ingestion</h2>
        <p className="text-sm text-slate-400">
          Upload PDFs to add them to the Data Core. The Librarian will process and categorize them.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 mb-8 transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-blue-500/20' : 'bg-slate-700'}`}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-400' : 'text-slate-400'}`} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {isDragging ? 'Drop files here' : 'Drop PDFs here or click to browse'}
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Supports: PDF files up to 50MB
            </p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              Select Files
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Pending Review ({pendingFiles.length})
            </h3>
            <button className="text-xs text-blue-400 hover:text-blue-300">
              Clear All
            </button>
          </div>

          <div className="space-y-3">
            {pendingFiles.map((file) => (
              <div
                key={file.id}
                className="bg-slate-800 rounded-lg border border-slate-700 p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-700 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white mb-1 truncate">
                          {file.name}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {file.status === 'ready' && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded border border-green-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Ready
                          </span>
                        )}
                        {file.status === 'pending' && (
                          <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded border border-amber-500/30">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          Category
                        </label>
                        <select
                          value={file.category}
                          onChange={(e) => {
                            setPendingFiles(files =>
                              files.map(f =>
                                f.id === file.id ? { ...f, category: e.target.value } : f
                              )
                            );
                          }}
                          className="w-full px-2 py-1.5 bg-slate-900 text-slate-200 text-xs rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                        >
                          <option>A: Methodology</option>
                          <option>B: Regulatory</option>
                          <option>C: Specs</option>
                          <option>D: Project Context</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Code</label>
                        <input
                          type="text"
                          value={file.code}
                          onChange={(e) => {
                            setPendingFiles(files =>
                              files.map(f =>
                                f.id === file.id ? { ...f, code: e.target.value } : f
                              )
                            );
                          }}
                          className="w-full px-2 py-1.5 bg-slate-900 text-slate-200 text-xs rounded border border-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Year
                        </label>
                        <input
                          type="text"
                          value={file.year}
                          onChange={(e) => {
                            setPendingFiles(files =>
                              files.map(f =>
                                f.id === file.id ? { ...f, year: e.target.value } : f
                              )
                            );
                          }}
                          className="w-full px-2 py-1.5 bg-slate-900 text-slate-200 text-xs rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePublish(file.id)}
                        disabled={file.status !== 'ready'}
                        className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-medium rounded transition-colors"
                      >
                        Publish to Store
                      </button>
                      <button
                        onClick={() => handleRemove(file.id)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pendingFiles.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-slate-800 rounded-full mb-3">
                <FileText className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-sm text-slate-400">No pending files</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
