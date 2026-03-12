

interface NavigationProps {
  currentPage: 'home' | 'config' | 'logs';
  onNavigate: (page: 'home' | 'config' | 'logs') => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="border-b-3 border-dark bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-coral border-3 border-dark flex items-center justify-center shadow-brutal-sm">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="square" 
                strokeLinejoin="miter"
                className="text-white"
              >
                <rect x="2" y="2" width="20" height="20" rx="2" />
                <path d="M7 2v20" />
                <path d="M17 2v20" />
                <path d="M2 12h20" />
                <path d="M2 7h5" />
                <path d="M2 17h5" />
                <path d="M17 7h5" />
                <path d="M17 17h5" />
              </svg>
            </div>
            <h1 className="text-2xl font-black tracking-tight">CinéNext</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('home')}
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            >
              Séances
            </button>
            <button
              onClick={() => onNavigate('config')}
              className={`nav-link ${currentPage === 'config' ? 'active' : ''}`}
            >
              Configuration
            </button>
            <button
              onClick={() => onNavigate('logs')}
              className={`nav-link ${currentPage === 'logs' ? 'active' : ''}`}
            >
              Logs
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
