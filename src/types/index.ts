export interface Cinema {
  id: string;
  name: string;
  url: string;
}

export interface Config {
  apiKey: string;
  models: string[];
  cinemas: Cinema[];
  cacheDurationMinutes: number;
}

export interface Showtime {
  title: string;
  time: string;
  room?: string;
  version?: string;
  filmUrl?: string;
}

export interface CinemaResult {
  cinema: Cinema;
  showtimes: Showtime[];
  lastFetched: string;
  fromCache: boolean;
  error?: string;
}

export interface CachedData {
  markdown: string;
  showtimes: Showtime[];
  timestamp: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface CinemaLoadingState {
  state: LoadingState;
  message?: string;
}
