export function WorkInProgressBanner() {
  return (
    <div className="card-brutal bg-yellow-100 border-yellow-500">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-yellow-500 border-2 border-dark flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-bold text-dark mb-1">
            🚧 Version Beta - Work in Progress
          </p>
          <p className="text-sm text-gray-700">
            L'extraction des séances via IA n'est pas encore parfaite. Certaines séances peuvent ne pas apparaître. 
            Utilisez les <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-logs'))}
              className="underline font-medium hover:text-coral"
            >logs</button> pour debugger si besoin.
          </p>
        </div>
      </div>
    </div>
  );
}
