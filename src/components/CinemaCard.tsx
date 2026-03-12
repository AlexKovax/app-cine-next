import type { Cinema, Showtime, LoadingState } from '../types';

interface CinemaCardProps {
  cinema: Cinema;
  showtimes: Showtime[];
  loadingState: LoadingState;
  error?: string;
  lastFetched?: string;
  fromCache?: boolean;
}

function LoadingSpinner() {
  return (
    <div className="inline-flex items-center gap-2">
      <svg 
        className="animate-spin h-5 w-5" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" cy="12" r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="text-sm font-bold">Chargement...</span>
    </div>
  );
}

function ShowtimeCard({ showtime }: { showtime: Showtime }) {
  return (
    <div className="card-brutal-sm bg-white border-2 border-dark p-3 hover:shadow-brutal-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-lg leading-tight truncate" title={showtime.title}>
            {showtime.filmUrl ? (
              <a 
                href={showtime.filmUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-coral transition-colors"
              >
                {showtime.title}
              </a>
            ) : (
              showtime.title
            )}
          </h4>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {showtime.version && (
              <span className="badge-brutal badge-coral text-xs">
                {showtime.version}
              </span>
            )}
            {showtime.room && (
              <span className="text-sm font-medium text-gray-600">
                {showtime.room}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-coral">{showtime.time}</span>
        </div>
      </div>
    </div>
  );
}

export function CinemaCard({ 
  cinema, 
  showtimes, 
  loadingState, 
  error,
  lastFetched,
  fromCache 
}: CinemaCardProps) {
  return (
    <div className="card-brutal">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-black">{cinema.name}</h3>
          <a 
            href={cinema.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-coral transition-colors font-medium truncate max-w-xs inline-block"
          >
            Voir sur AlloCiné →
          </a>
        </div>
        <div className="flex flex-col items-end gap-1">
          {loadingState === 'loading' && (
            <span className="badge-brutal badge-warning">
              <LoadingSpinner />
            </span>
          )}
          {loadingState === 'success' && (
            <span className="badge-brutal badge-success">
              {showtimes.length} séance{showtimes.length !== 1 ? 's' : ''}
            </span>
          )}
          {loadingState === 'error' && (
            <span className="badge-brutal badge-error">Erreur</span>
          )}
          {fromCache && loadingState === 'success' && (
            <span className="badge-brutal badge-warning text-xs">Cache</span>
          )}
        </div>
      </div>

      {loadingState === 'loading' && (
        <div className="py-8 text-center">
          <LoadingSpinner />
          <p className="text-gray-500 mt-2 text-sm">Récupération des séances...</p>
        </div>
      )}

      {loadingState === 'error' && (
        <div className="py-6 px-4 bg-red-50 border-2 border-red-500">
          <p className="text-red-700 font-medium text-center">{error || 'Une erreur est survenue'}</p>
        </div>
      )}

      {loadingState === 'success' && (
        <>
          {showtimes.length === 0 ? (
            <div className="py-8 text-center bg-gray-50 border-2 border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">Aucune séance dans les 30 prochaines minutes</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {showtimes.map((showtime, index) => (
                <ShowtimeCard key={`${showtime.title}-${showtime.time}-${index}`} showtime={showtime} />
              ))}
            </div>
          )}
          {lastFetched && (
            <p className="text-xs text-gray-400 mt-4 text-right">
              Mis à jour : {new Date(lastFetched).toLocaleTimeString('fr-FR')}
            </p>
          )}
        </>
      )}

      {loadingState === 'idle' && (
        <div className="py-8 text-center text-gray-400">
          <p className="text-sm">Cliquez sur "Récupérer les séances" pour voir les films</p>
        </div>
      )}
    </div>
  );
}
