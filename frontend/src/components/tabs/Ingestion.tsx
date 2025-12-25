import React, { useState, useRef } from 'react';
import { Upload, FileText, Activity, CheckCircle, AlertCircle, Terminal } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warning';
  message: string;
  step?: string;
}

export default function Ingestion() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        addLog('error', 'Solo se permiten archivos PDF');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const addLog = (level: LogEntry['level'], message: string, step?: string) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      step
    }]);
    setTimeout(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setLogs([]);
    addLog('info', 'Iniciando proceso de ingesta...', 'Inicio');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/v1/ingest/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Process all complete lines
        buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

        for (const line of lines) {
            if (line.trim() === '') continue;
            try {
                const data = JSON.parse(line);
                // Map backend log levels to frontend
                let level: LogEntry['level'] = 'info';
                if (data.level === 'ERROR') level = 'error';
                if (data.level === 'SUCCESS') level = 'success';
                if (data.level === 'WARNING') level = 'warning';
                
                addLog(level, data.message, data.step);
            } catch (e) {
                console.error('Error parsing log line:', line, e);
                addLog('info', line); // Fallback for non-JSON lines
            }
        }
      }

      addLog('success', 'Proceso completado exitosamente', 'Fin');

    } catch (error) {
      console.error('Upload error:', error);
      addLog('error', error instanceof Error ? error.message : 'Error desconocido en la subida');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Ingesta de Documentos</h2>
          <p className="text-gray-400">Sube tus PDFs para procesarlos en el Data Core</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20">
          <Activity size={16} />
          <span>Motor Activo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
        {/* Upload Area */}
        <div className="flex flex-col gap-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all duration-300
              ${isDragging 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
              }
            `}
          >
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 shadow-lg">
              <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {file ? file.name : 'Arrastra tu PDF aquí'}
            </h3>
            <p className="text-gray-400 text-center max-w-xs mb-6">
              {file 
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                : 'O selecciona un archivo de tu ordenador'
              }
            </p>
            
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            
            <div className="flex gap-3">
              <label
                htmlFor="file-upload"
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer transition-colors font-medium"
              >
                Seleccionar
              </label>
              {file && (
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                    ${isUploading 
                      ? 'bg-blue-600/50 cursor-not-allowed text-blue-200' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                    }
                  `}
                >
                  {isUploading ? (
                    <>
                      <Activity className="animate-spin" size={18} />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      Procesar
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Stats / Info */}
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Pipeline Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Sanitización (PyMuPDF)</span>
                <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14} /> Ready</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Gemini File API</span>
                <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14} /> Connected</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Vector Store</span>
                <span className="text-blue-400 flex items-center gap-1"><Activity size={14} /> Waiting</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal / Logs */}
        <div className="bg-[#0d1117] rounded-xl border border-gray-800 flex flex-col overflow-hidden shadow-xl">
          <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-gray-400" />
              <span className="text-sm font-mono text-gray-300">System Logs</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-2 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2 opacity-50">
                <Activity size={32} />
                <p>Esperando actividad...</p>
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
                  <div className="flex-1 break-all">
                    {log.step && (
                      <span className="text-blue-500 font-bold mr-2">[{log.step}]</span>
                    )}
                    <span className={`
                      ${log.level === 'error' ? 'text-red-400' : ''}
                      ${log.level === 'success' ? 'text-green-400' : ''}
                      ${log.level === 'warning' ? 'text-yellow-400' : ''}
                      ${log.level === 'info' ? 'text-gray-300' : ''}
                    `}>
                      {log.message}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
