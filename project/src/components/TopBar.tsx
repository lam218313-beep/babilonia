import { Search, Database, Activity } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold text-white">Babilonia Data Core</span>
        </div>

        <select className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 text-sm focus:outline-none focus:border-blue-500">
          <option>Hospital Puno</option>
          <option>Project Alpha</option>
          <option>Project Beta</option>
        </select>

        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-md border border-amber-500/30">
          DEV
        </span>
      </div>

      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents, queries, or codes..."
            className="w-full bg-slate-800 text-slate-200 pl-10 pr-20 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 text-sm"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded border border-slate-600">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          Consult
        </button>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors">
          Ingest
        </button>

        <div className="flex items-center gap-3 ml-3 pl-3 border-l border-slate-700">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs text-slate-400">120ms</span>
          </div>
          <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded border border-green-500/30">
            Cache: Hit
          </div>
        </div>
      </div>
    </div>
  );
}
