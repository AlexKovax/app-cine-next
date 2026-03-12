import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { ConfigurationPage } from './pages/ConfigurationPage';
import { LogsPage } from './pages/LogsPage';
import { useConfig } from './hooks/useConfig';

type Page = 'home' | 'config' | 'logs';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { 
    config, 
    isLoaded,
    updateApiKey,
    addCinema,
    updateCinema,
    removeCinema,
    updateCacheDuration,
  } = useConfig();

  // Listen for navigation events from pages
  useEffect(() => {
    const handleNavigate = (e: CustomEvent<Page>) => {
      setCurrentPage(e.detail);
    };
    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate', handleNavigate as EventListener);
  }, []);
  
  // Listen for log navigation from HomePage
  useEffect(() => {
    const handleLogNavigate = () => {
      setCurrentPage('logs');
    };
    window.addEventListener('navigate-to-logs', handleLogNavigate as EventListener);
    return () => window.removeEventListener('navigate-to-logs', handleLogNavigate as EventListener);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-coral" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xl font-bold">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="flex-1 pb-12">
        {currentPage === 'home' && <HomePage config={config} />}
        {currentPage === 'config' && (
          <ConfigurationPage
            config={config}
            updateApiKey={updateApiKey}
            addCinema={addCinema}
            updateCinema={updateCinema}
            removeCinema={removeCinema}
            updateCacheDuration={updateCacheDuration}
          />
        )}
        {currentPage === 'logs' && <LogsPage />}
      </main>

      <footer className="border-t-3 border-dark bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">
            CinéNext — Trouvez vos séances en un clic
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
