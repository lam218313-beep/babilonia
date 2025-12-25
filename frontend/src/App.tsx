import { useState } from 'react';
import { MessageSquare, Upload, Activity } from 'lucide-react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import QueryChat from './components/tabs/QueryChat';
import Ingestion from './components/tabs/Ingestion';
import Observability from './components/tabs/Observability';

type Tab = 'query' | 'ingest' | 'observe';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('query');

  const tabs = [
    { id: 'query' as Tab, label: 'Query & Chat', icon: MessageSquare },
    { id: 'ingest' as Tab, label: 'Ingestion', icon: Upload },
    { id: 'observe' as Tab, label: 'Observability', icon: Activity },
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <div className="border-b border-slate-800 bg-slate-900">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 bg-slate-950 overflow-hidden">
            {activeTab === 'query' && <QueryChat />}
            {activeTab === 'ingest' && <Ingestion />}
            {activeTab === 'observe' && <Observability />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
