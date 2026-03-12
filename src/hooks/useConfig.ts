import { useState, useEffect, useCallback } from 'react';
import type { Config, Cinema } from '../types';

const STORAGE_KEY = 'cinenext-config';

const DEFAULT_MODELS = [
  'anthropic/claude-haiku-4.5',
];

const DEFAULT_CONFIG: Config = {
  apiKey: '',
  models: DEFAULT_MODELS,
  cinemas: [],
  cacheDurationMinutes: 15,
};

export function useConfig() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          models: DEFAULT_MODELS, // Toujours utiliser le modèle par défaut
          cacheDurationMinutes: parsed.cacheDurationMinutes || 15,
        });
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
    setIsLoaded(true);
  }, []);

  const saveConfig = useCallback((newConfig: Config) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }, []);

  const updateApiKey = useCallback((apiKey: string) => {
    saveConfig({ ...config, apiKey });
  }, [config, saveConfig]);

  const updateModels = useCallback((models: string[]) => {
    saveConfig({ ...config, models });
  }, [config, saveConfig]);

  const addCinema = useCallback((name: string, url: string) => {
    const newCinema: Cinema = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      url,
    };
    saveConfig({
      ...config,
      cinemas: [...config.cinemas, newCinema],
    });
  }, [config, saveConfig]);

  const updateCinema = useCallback((id: string, name: string, url: string) => {
    saveConfig({
      ...config,
      cinemas: config.cinemas.map((c) =>
        c.id === id ? { ...c, name, url } : c
      ),
    });
  }, [config, saveConfig]);

  const removeCinema = useCallback((id: string) => {
    saveConfig({
      ...config,
      cinemas: config.cinemas.filter((c) => c.id !== id),
    });
  }, [config, saveConfig]);

  const updateCacheDuration = useCallback((minutes: number) => {
    saveConfig({ ...config, cacheDurationMinutes: minutes });
  }, [config, saveConfig]);

  return {
    config,
    isLoaded,
    updateApiKey,
    updateModels,
    addCinema,
    updateCinema,
    removeCinema,
    updateCacheDuration,
  };
}
