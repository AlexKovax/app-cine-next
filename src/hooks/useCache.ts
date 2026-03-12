import { useCallback } from 'react';
import type { CachedData, Showtime } from '../types';
import { addLog } from '../services/logging';

const CACHE_PREFIX = 'cinenext-cache-';

export function useCache(cacheDurationMinutes: number) {
  const getCacheKey = (cinemaId: string) => `${CACHE_PREFIX}${cinemaId}`;

  const getCachedData = useCallback((cinemaId: string, cinemaName?: string): CachedData | null => {
    try {
      const stored = localStorage.getItem(getCacheKey(cinemaId));
      if (!stored) {
        addLog({
          service: 'cache',
          level: 'info',
          cinemaId,
          cinemaName,
          message: 'Cache miss - aucune donnée en cache',
        });
        return null;
      }

      const data: CachedData = JSON.parse(stored);
      const now = Date.now();
      const maxAge = cacheDurationMinutes * 60 * 1000;
      const age = now - data.timestamp;
      const ageMinutes = Math.round(age / 60000);

      if (age > maxAge) {
        localStorage.removeItem(getCacheKey(cinemaId));
        addLog({
          service: 'cache',
          level: 'info',
          cinemaId,
          cinemaName,
          message: `Cache expiré (${ageMinutes}min > ${cacheDurationMinutes}min)`,
          details: { markdownLength: data.markdown.length }
        });
        return null;
      }

      addLog({
        service: 'cache',
        level: 'success',
        cinemaId,
        cinemaName,
        message: `Cache hit - ${data.showtimes.length} séance(s) (${ageMinutes}min)`,
        details: { 
          markdownLength: data.markdown.length,
          showtimes: data.showtimes 
        }
      });

      return data;
    } catch (error) {
      addLog({
        service: 'cache',
        level: 'error',
        cinemaId,
        cinemaName,
        message: `Erreur lecture cache: ${error instanceof Error ? error.message : 'Unknown'}`,
      });
      return null;
    }
  }, [cacheDurationMinutes]);

  const setCachedData = useCallback((cinemaId: string, markdown: string, showtimes: Showtime[], cinemaName?: string) => {
    try {
      const data: CachedData = {
        markdown,
        showtimes,
        timestamp: Date.now(),
      };
      localStorage.setItem(getCacheKey(cinemaId), JSON.stringify(data));
      
      addLog({
        service: 'cache',
        level: 'success',
        cinemaId,
        cinemaName,
        message: `Cache sauvegardé - ${showtimes.length} séance(s)`,
        details: { markdownLength: markdown.length }
      });
    } catch (error) {
      addLog({
        service: 'cache',
        level: 'error',
        cinemaId,
        cinemaName,
        message: `Erreur sauvegarde cache: ${error instanceof Error ? error.message : 'Unknown'}`,
      });
    }
  }, []);

  const clearCache = useCallback((cinemaId?: string, cinemaName?: string) => {
    try {
      if (cinemaId) {
        localStorage.removeItem(getCacheKey(cinemaId));
        addLog({
          service: 'cache',
          level: 'info',
          cinemaId,
          cinemaName,
          message: 'Cache effacé pour ce cinéma',
        });
      } else {
        const keys = Object.keys(localStorage).filter((key) => key.startsWith(CACHE_PREFIX));
        keys.forEach((key) => localStorage.removeItem(key));
        addLog({
          service: 'cache',
          level: 'info',
          message: `Cache global effacé (${keys.length} entrée(s))`,
        });
      }
    } catch (error) {
      addLog({
        service: 'cache',
        level: 'error',
        message: `Erreur effacement cache: ${error instanceof Error ? error.message : 'Unknown'}`,
      });
    }
  }, []);

  return { getCachedData, setCachedData, clearCache };
}
