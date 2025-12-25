import { Send, ShieldCheck, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: string;
  type: 'user' | 'system';
  content: string;
  confidence?: number;
  sources?: string[];
  timestamp: Date;
}

interface Citation {
  code: string;
  article: string;
  text: string;
}

export default function QueryChat() {
  const [strictMode, setStrictMode] = useState(true);
  const [selectedCitation, setSelectedCitation] = useState<Citation>({
    code: 'Norma E.030',
    article: 'Artículo 14',
    text: 'Los establecimientos de salud del segundo y tercer nivel de atención deberán contar con sistemas de climatización que garanticen las condiciones de temperatura y humedad relativa apropiadas para cada ambiente según su función específica. Las salas de operaciones mantendrán una temperatura entre 20°C y 24°C, con humedad relativa entre 50% y 60%.',
  });

  const [messages] = useState<Message[]>([
    {
      id: '1',
      type: 'user',
      content: '¿Cuáles son los requisitos de climatización para salas de operaciones en hospitales del tercer nivel?',
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: '2',
      type: 'system',
      content: 'Según la **Norma E.030 (Artículo 14)**, los establecimientos de salud del tercer nivel deben cumplir con los siguientes requisitos de climatización para salas de operaciones:\n\n• **Temperatura**: 20°C - 24°C\n• **Humedad relativa**: 50% - 60%\n• **Renovación de aire**: Mínimo 15 cambios por hora\n• **Filtración**: HEPA con eficiencia mínima del 99.97%\n\nEstos parámetros garantizan condiciones asépticas y confort para el equipo médico durante procedimientos quirúrgicos.',
      confidence: 0.96,
      sources: ['Norma E.030 - Art. 14', 'RNE Actualización 2023'],
      timestamp: new Date(Date.now() - 290000),
    },
  ]);

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
  };

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">Chat History</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {[
            'Requisitos climatización salas...',
            'Dimensiones mínimas consultorios',
            'Especificaciones puertas cortafuego',
            'Normativa sistema eléctrico',
          ].map((title, idx) => (
            <button
              key={idx}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                idx === 0
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.type === 'user' ? 'w-auto' : 'w-full'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-slate-400">
                    {message.type === 'user' ? 'You' : 'System'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                <div
                  className={`rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    {message.content.split('\n').map((line, idx) => (
                      <p key={idx} className="mb-2 last:mb-0">
                        {line.includes('**') ? (
                          line.split('**').map((part, i) =>
                            i % 2 === 1 ? (
                              <strong key={i} className="font-semibold">
                                {part}
                              </strong>
                            ) : (
                              part
                            )
                          )
                        ) : (
                          line
                        )}
                      </p>
                    ))}
                  </div>

                  {message.confidence && (
                    <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Confidence:</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${message.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-green-400">
                            {(message.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {message.sources && (
                        <div className="flex gap-1.5">
                          {message.sources.map((source, idx) => (
                            <button
                              key={idx}
                              onClick={() =>
                                handleCitationClick({
                                  code: source.split(' - ')[0],
                                  article: source.split(' - ')[1] || '',
                                  text: selectedCitation.text,
                                })
                              }
                              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {source}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 p-4 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={strictMode}
                  onChange={(e) => setStrictMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
              <span className="flex items-center gap-1.5 text-sm text-slate-300">
                <ShieldCheck className="w-4 h-4" />
                Strict Mode
              </span>
            </label>
            <span className="text-xs text-slate-500">
              {strictMode ? 'Regulatory compliance enforced' : 'General context mode'}
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask about regulations, specifications, or project context..."
              className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-200 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 text-sm"
            />
            <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="w-96 border-l border-slate-800 bg-slate-900/50 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">Evidence & Context</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-3 bg-slate-900 border-b border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-semibold text-blue-400">
                  {selectedCitation.code}
                </span>
                <button className="p-1 hover:bg-slate-800 rounded transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
              <span className="text-xs text-slate-400">{selectedCitation.article}</span>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-300 leading-relaxed">{selectedCitation.text}</p>
            </div>
            <div className="p-3 bg-slate-900 border-t border-slate-700">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded border border-green-500/30">
                  Active
                </span>
                <span>|</span>
                <span>Updated: 2023</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Related Articles
            </h4>
            {['Artículo 15 - Ventilación', 'Artículo 16 - Iluminación', 'Artículo 13 - Espacios'].map(
              (article, idx) => (
                <button
                  key={idx}
                  className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                >
                  <span className="text-xs text-slate-300">{article}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
