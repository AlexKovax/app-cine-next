import { ApiKeyInput } from '../components/ApiKeyInput';
import { CinemaList } from '../components/CinemaList';
import type { Config } from '../types';

interface ConfigurationPageProps {
  config: Config;
  updateApiKey: (key: string) => void;
  addCinema: (name: string, url: string) => void;
  updateCinema: (id: string, name: string, url: string) => void;
  removeCinema: (id: string) => void;
  updateCacheDuration: (minutes: number) => void;
}

export function ConfigurationPage({
  config,
  updateApiKey,
  addCinema,
  updateCinema,
  removeCinema,
  updateCacheDuration,
}: ConfigurationPageProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black mb-2">Configuration</h1>
        <p className="text-gray-600">Gérez vos paramètres et vos cinémas favoris</p>
      </div>

      <div className="card-brutal space-y-6">
        <ApiKeyInput value={config.apiKey} onChange={updateApiKey} />
      </div>

      <div className="card-brutal space-y-6">
        <div className="space-y-2">
          <label className="block font-bold text-lg">Durée du cache</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={config.cacheDurationMinutes}
              onChange={(e) => updateCacheDuration(parseInt(e.target.value))}
              className="flex-1 h-3 bg-gray-200 border-2 border-dark appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #FF6B6B 0%, #FF6B6B ${(config.cacheDurationMinutes - 5) / 55 * 100}%, #e5e7eb ${(config.cacheDurationMinutes - 5) / 55 * 100}%, #e5e7eb 100%)`
              }}
            />
            <span className="font-bold text-lg w-20 text-right">{config.cacheDurationMinutes} min</span>
          </div>
          <p className="text-sm text-gray-600">
            Les données seront mises en cache pendant cette durée pour éviter les appels inutiles.
          </p>
        </div>
      </div>

      <CinemaList
        cinemas={config.cinemas}
        onAdd={addCinema}
        onUpdate={updateCinema}
        onRemove={removeCinema}
      />

      <div className="card-brutal bg-gray-50">
        <h3 className="font-bold text-lg mb-3">À propos des modèles LLM</h3>
        <p className="text-sm text-gray-600 mb-3">
          L'application utilise les modèles suivants dans l'ordre (fallback automatique) :
        </p>
        <ul className="space-y-2">
          {config.models.map((model, index) => (
            <li key={model} className="flex items-center gap-2 text-sm">
              <span className="badge-brutal badge-coral text-xs">{index + 1}</span>
              <span className="font-medium">{model}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
