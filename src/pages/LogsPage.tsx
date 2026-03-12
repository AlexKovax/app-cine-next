import { useState, useEffect, useCallback } from 'react';
import { getLogs, clearLogs, exportLogs, type LogEntry, type LogLevel } from '../services/logging';

type FilterService = 'all' | LogEntry['service'];
type FilterLevel = 'all' | LogLevel;

export function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [serviceFilter, setServiceFilter] = useState<FilterService>('all');
  const [levelFilter, setLevelFilter] = useState<FilterLevel>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadLogs = useCallback(() => {
    const allLogs = getLogs();
    setLogs(allLogs);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    let filtered = logs;

    if (serviceFilter !== 'all') {
      filtered = filtered.filter(log => log.service === serviceFilter);
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(term) ||
        log.cinemaName?.toLowerCase().includes(term) ||
        log.details?.model?.toLowerCase().includes(term)
      );
    }

    setFilteredLogs(filtered);
  }, [logs, serviceFilter, levelFilter, searchTerm]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadLogs, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadLogs]);

  const handleClear = () => {
    if (confirm('Voulez-vous vraiment effacer tous les logs ?')) {
      clearLogs();
      loadLogs();
      setSelectedLog(null);
    }
  };

  const handleExport = () => {
    const data = exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinenext-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'info': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
    }
  };

  const getServiceIcon = (service: LogEntry['service']) => {
    switch (service) {
      case 'jina':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        );
      case 'openrouter':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'cache':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        );
      case 'app':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel - Filters and List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black">Logs</h1>
              <p className="text-gray-600">
                {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''} • {logs.length} total
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExport} className="btn-brutal-secondary text-sm py-2 px-3">
                Exporter
              </button>
              <button onClick={handleClear} className="btn-brutal-danger text-sm py-2 px-3">
                Effacer
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="card-brutal mb-6 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-sm mb-1">Service</label>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value as FilterService)}
                  className="input-brutal text-sm py-2"
                >
                  <option value="all">Tous</option>
                  <option value="jina">Jina AI</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="cache">Cache</option>
                  <option value="app">App</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-sm mb-1">Niveau</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value as FilterLevel)}
                  className="input-brutal text-sm py-2"
                >
                  <option value="all">Tous</option>
                  <option value="info">Info</option>
                  <option value="success">Succès</option>
                  <option value="warning">Avertissement</option>
                  <option value="error">Erreur</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-sm mb-1">Recherche</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrer..."
                  className="input-brutal text-sm py-2"
                />
              </div>
              <div>
                <label className="block font-bold text-sm mb-1">Auto-refresh</label>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`w-full text-sm py-2 px-4 font-bold border-3 border-dark transition-all ${
                    autoRefresh ? 'bg-green-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {autoRefresh ? 'ON (2s)' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Logs List */}
          <div className="space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="card-brutal p-8 text-center text-gray-500">
                Aucun log à afficher
              </div>
            ) : (
              filteredLogs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`w-full text-left card-brutal p-3 transition-all hover:translate-x-1 ${
                    selectedLog?.id === log.id ? 'ring-2 ring-coral' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getLevelColor(log.level)}`} />
                    <div className="flex items-center gap-1 text-gray-600">
                      {getServiceIcon(log.service)}
                    </div>
                    <span className="text-xs font-mono text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                    </span>
                    {log.cinemaName && (
                      <span className="text-xs font-medium truncate max-w-[150px]">
                        {log.cinemaName}
                      </span>
                    )}
                    <span className="flex-1 text-sm truncate">{log.message}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel - Details */}
        <div className="lg:w-1/3">
          <div className="sticky top-4">
            <h2 className="text-xl font-black mb-4">Détails</h2>
            {selectedLog ? (
              <div className="card-brutal space-y-4">
                <div>
                  <span className={`inline-block px-2 py-1 text-xs font-bold text-white rounded ${getLevelColor(selectedLog.level)}`}>
                    {selectedLog.level.toUpperCase()}
                  </span>
                  <span className="ml-2 text-sm font-mono text-gray-500">
                    {new Date(selectedLog.timestamp).toLocaleString('fr-FR')}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Service</label>
                  <p className="font-medium">{selectedLog.service}</p>
                </div>

                {selectedLog.cinemaName && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Cinéma</label>
                    <p className="font-medium">{selectedLog.cinemaName}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Message</label>
                  <p className="font-medium">{selectedLog.message}</p>
                </div>

                {selectedLog.details && (
                  <>
                    {selectedLog.details.model && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Modèle</label>
                        <p className="font-mono text-sm">{selectedLog.details.model}</p>
                      </div>
                    )}

                    {selectedLog.details.duration && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Durée</label>
                        <p className="font-mono text-sm">{selectedLog.details.duration}ms</p>
                      </div>
                    )}

                    {selectedLog.details.markdownLength && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Taille markdown</label>
                        <p className="font-mono text-sm">{selectedLog.details.markdownLength} caractères</p>
                      </div>
                    )}

                    {selectedLog.details.prompt && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Prompt</label>
                        <pre className="mt-1 p-2 bg-gray-100 border-2 border-dark text-xs overflow-auto max-h-40">
                          {selectedLog.details.prompt}
                        </pre>
                      </div>
                    )}

                    {selectedLog.details.request && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Requête</label>
                        <pre className="mt-1 p-2 bg-gray-100 border-2 border-dark text-xs overflow-auto max-h-40">
                          {JSON.stringify(selectedLog.details.request, null, 2)}
                        </pre>
                      </div>
                    )}

                    {selectedLog.details.response && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Réponse</label>
                        <pre className="mt-1 p-2 bg-gray-100 border-2 border-dark text-xs overflow-auto max-h-60">
                          {typeof selectedLog.details.response === 'string' 
                            ? selectedLog.details.response 
                            : JSON.stringify(selectedLog.details.response, null, 2)}
                        </pre>
                      </div>
                    )}

                    {selectedLog.details.error && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase text-red-600">Erreur</label>
                        <pre className="mt-1 p-2 bg-red-50 border-2 border-red-500 text-xs overflow-auto max-h-40 text-red-700">
                          {selectedLog.details.error}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="card-brutal p-8 text-center text-gray-500">
                Cliquez sur un log pour voir les détails
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
