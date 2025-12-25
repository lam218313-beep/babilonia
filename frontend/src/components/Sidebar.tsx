import { FileText, ChevronLeft, Filter } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const stores = [
    { id: 'A', name: 'Methodology', count: 247, status: 'green' },
    { id: 'B', name: 'Regulatory', count: 1893, status: 'green' },
    { id: 'C', name: 'Specs', count: 521, status: 'yellow' },
    { id: 'D', name: 'Project Context', count: 89, status: 'green' },
  ];

  const intents = [
    { name: 'Lookup', count: 1247 },
    { name: 'Cross-check', count: 892 },
    { name: 'Synthesis', count: 456 },
  ];

  if (collapsed) {
    return (
      <div className="w-12 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Navigation</h2>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 hover:bg-slate-800 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Stores
            </h3>
            <div className="space-y-2">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className={`w-2 h-2 rounded-full ${store.status === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                    <div className="flex-1">
                      <div className="text-sm text-slate-200 group-hover:text-white">
                        {store.id}: {store.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {store.count.toLocaleString()} docs
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              Filters
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Jurisdiction</label>
                <div className="flex gap-2">
                  <button className="px-2.5 py-1.5 bg-blue-600 text-white text-xs rounded-md">
                    Peru
                  </button>
                  <button className="px-2.5 py-1.5 bg-slate-800 text-slate-400 text-xs rounded-md hover:bg-slate-700">
                    Int
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Year Range</label>
                <input
                  type="text"
                  placeholder="2020-2024"
                  className="w-full px-2.5 py-1.5 bg-slate-800 text-slate-200 text-xs rounded-md border border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Validity</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs text-slate-300">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs text-slate-300">Revoked</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Intents
            </h3>
            <div className="space-y-1.5">
              {intents.map((intent) => (
                <button
                  key={intent.name}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-slate-800 text-left transition-colors group"
                >
                  <span className="text-sm text-slate-300 group-hover:text-white">
                    {intent.name}
                  </span>
                  <span className="text-xs text-slate-500">{intent.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
