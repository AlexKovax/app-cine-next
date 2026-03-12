import { useState, useCallback, useMemo } from 'react';
import { CinemaCard } from '../components/CinemaCard';
import { WorkInProgressBanner } from '../components/WorkInProgressBanner';
import { fetchShowtimes } from '../services/showtimes';
import { useCache } from '../hooks/useCache';
import type { Config, Cinema, CinemaResult, CinemaLoadingState } from '../types';

interface HomePageProps {
  config: Config;
}

export function HomePage({ config }: HomePageProps) {
  const [results, setResults] = useState<Map<string, CinemaResult>>(new Map());
  const [loadingStates, setLoadingStates] = useState<Map<string, CinemaLoadingState>>(new Map());
  const [lastGlobalFetch, setLastGlobalFetch] = useState<string | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);
  
  const { getCachedData, setCachedData, clearCache } = useCache(config.cacheDurationMinutes);

  const isConfigured = config.apiKey && config.cinemas.length > 0;

  const fetchCinema = useCallback(async (cinema: Cinema, skipCache: boolean = false) => {
    setLoadingStates(prev => new Map(prev.set(cinema.id, { state: 'loading', message: 'Démarrage...' })));

    try {
      // Check cache first
      if (!skipCache && !forceRefresh) {
        const cached = getCachedData(cinema.id, cinema.name);
        if (cached) {
          setResults(prev => new Map(prev.set(cinema.id, {
            cinema,
            showtimes: cached.showtimes,
            lastFetched: new Date(cached.timestamp).toISOString(),
            fromCache: true,
          })));
          setLoadingStates(prev => new Map(prev.set(cinema.id, { state: 'success' })));
          return;
        }
      }

      // Fetch fresh data
      const { markdown, showtimes } = await fetchShowtimes(
        cinema, 
        config,
        (message) => setLoadingStates(prev => new Map(prev.set(cinema.id, { state: 'loading', message })))
      );

      // Cache the results
      setCachedData(cinema.id, markdown, showtimes, cinema.name);

      setResults(prev => new Map(prev.set(cinema.id, {
        cinema,
        showtimes,
        lastFetched: new Date().toISOString(),
        fromCache: false,
      })));
      setLoadingStates(prev => new Map(prev.set(cinema.id, { state: 'success' })));
    } catch (error) {
      setResults(prev => new Map(prev.set(cinema.id, {
        cinema,
        showtimes: [],
        lastFetched: new Date().toISOString(),
        fromCache: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      })));
      setLoadingStates(prev => new Map(prev.set(cinema.id, { 
        state: 'error',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      })));
    }
  }, [config, getCachedData, setCachedData, forceRefresh]);

  const fetchAll = useCallback(async () => {
    setLastGlobalFetch(new Date().toISOString());
    await Promise.all(config.cinemas.map(cinema => fetchCinema(cinema)));
  }, [config.cinemas, fetchCinema]);

  const handleForceRefresh = useCallback(async () => {
    setForceRefresh(true);
    clearCache(undefined, 'Force refresh');
    setResults(new Map());
    await fetchAll();
    setForceRefresh(false);
  }, [clearCache, fetchAll]);

  const navigateToLogs = useCallback(() => {
    window.dispatchEvent(new CustomEvent('navigate-to-logs'));
  }, []);

  const totalShowtimes = useMemo(() => {
    let total = 0;
    results.forEach(result => {
      total += result.showtimes.length;
    });
    return total;
  }, [results]);

  if (!isConfigured) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="card-brutal text-center py-12">
          <div className="w-20 h-20 bg-gray-200 border-3 border-dark mx-auto mb-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-black mb-3">Configuration requise</h2>
          <p className="text-gray-600 mb-6">
            {!config.apiKey 
              ? "Veuillez configurer votre clé API OpenRouter pour commencer."
              : "Veuillez ajouter au moins un cinéma dans la configuration."
            }
          </p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'config' }))}
            className="btn-brutal"
          >
            Aller à la configuration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <WorkInProgressBanner />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Séances à venir</h1>
          <p className="text-gray-600">
            Films commençant dans les 30 prochaines minutes
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastGlobalFetch && (
            <span className="text-sm text-gray-500 hidden sm:inline">
              Dernière mise à jour : {new Date(lastGlobalFetch).toLocaleTimeString('fr-FR')}
            </span>
          )}
          <button
            onClick={handleForceRefresh}
            className="btn-brutal-secondary text-sm py-2 px-4"
            title="Forcer le rafraîchissement (ignore le cache)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            Forcer
          </button>
          <button
            onClick={fetchAll}
            className="btn-brutal"
            disabled={Array.from(loadingStates.values()).some(s => s.state === 'loading')}
          >
            {Array.from(loadingStates.values()).some(s => s.state === 'loading') ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement...
              </>
            ) : (
              'Récupérer les séances'
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {totalShowtimes > 0 && (
          <div className="card-brutal bg-coral text-white flex-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white border-3 border-dark flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-coral">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-black">{totalShowtimes}</p>
                <p className="font-medium opacity-90">séance{totalShowtimes !== 1 ? 's' : ''} trouvée{totalShowtimes !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={navigateToLogs}
          className="card-brutal bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-3 px-6"
        >
          <div className="w-10 h-10 bg-dark border-2 border-dark flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-black">Logs</p>
            <p className="text-xs text-gray-600">Voir les appels API</p>
          </div>
        </button>
      </div>

      <div className="grid gap-6">
        {config.cinemas.map((cinema) => {
          const result = results.get(cinema.id);
          const loadingState = loadingStates.get(cinema.id);
          
          return (
            <CinemaCard
              key={cinema.id}
              cinema={cinema}
              showtimes={result?.showtimes || []}
              loadingState={loadingState?.state || 'idle'}
              error={result?.error}
              lastFetched={result?.lastFetched}
              fromCache={result?.fromCache}
            />
          );
        })}
      </div>
    </div>
  );
}
