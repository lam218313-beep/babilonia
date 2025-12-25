import { Activity, TrendingUp, Clock, AlertCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  duration?: number;
}

export default function Observability() {
  const intentData = [
    { name: 'Lookup', count: 1247, percentage: 52 },
    { name: 'Cross-check', count: 892, percentage: 37 },
    { name: 'Synthesis', count: 456, percentage: 19 },
  ];

  const latencyData = [
    { time: '00:00', value: 120 },
    { time: '04:00', value: 95 },
    { time: '08:00', value: 180 },
    { time: '12:00', value: 210 },
    { time: '16:00', value: 165 },
    { time: '20:00', value: 140 },
  ];

  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 60000),
      level: 'info',
      message: 'Query executed: "requisitos climatización"',
      duration: 120,
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 120000),
      level: 'info',
      message: 'Document ingested: RNE_E030_2023.pdf',
      duration: 3400,
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 180000),
      level: 'warning',
      message: 'Cache miss for store B (Regulatory)',
      duration: 85,
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 240000),
      level: 'info',
      message: 'Cross-check completed: 24 documents analyzed',
      duration: 450,
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 300000),
      level: 'error',
      message: 'Failed to parse document metadata',
    },
  ];

  const maxLatency = Math.max(...latencyData.map((d) => d.value));

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-1">System Observability</h2>
        <p className="text-sm text-slate-400">Monitor queries, performance, and system health</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Total Queries</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">2,595</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">+12.5%</span>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Avg Latency</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">145ms</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">-8.2%</span>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Cache Hit Rate</span>
              <Activity className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">87.3%</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">+3.1%</span>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Error Rate</span>
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-white">0.3%</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-400 rotate-180" />
              <span className="text-xs text-green-400">-1.2%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Queries by Intent</h3>
            <div className="space-y-4">
              {intentData.map((intent) => (
                <div key={intent.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">{intent.name}</span>
                    <span className="text-sm font-medium text-white">{intent.count}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${intent.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Latency Trend (24h)</h3>
            <div className="flex items-end justify-between h-40 gap-2">
              {latencyData.map((point, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center flex-1">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-400"
                      style={{ height: `${(point.value / maxLatency) * 100}%` }}
                      title={`${point.value}ms`}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{point.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-white">Recent Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-slate-400 whitespace-nowrap">
                      {log.timestamp.toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          log.level === 'info'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : log.level === 'warning'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{log.message}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-400">
                      {log.duration ? `${log.duration}ms` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
