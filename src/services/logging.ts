export type LogLevel = 'info' | 'success' | 'error' | 'warning';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: 'jina' | 'openrouter' | 'cache' | 'app';
  cinemaId?: string;
  cinemaName?: string;
  message: string;
  details?: {
    request?: unknown;
    response?: unknown;
    prompt?: string;
    markdownLength?: number;
    model?: string;
    models?: string[];
    duration?: number;
    error?: string;
    errors?: string[];
    showtimes?: unknown;
    [key: string]: unknown;
  };
}

const LOGS_STORAGE_KEY = 'cinenext-logs';
const MAX_LOGS = 100;

export function addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>): void {
  try {
    const logs = getLogs();
    const newLog: LogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    // Add to beginning, keep only MAX_LOGS
    const updatedLogs = [newLog, ...logs].slice(0, MAX_LOGS);
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Failed to save log:', error);
  }
}

export function getLogs(): LogEntry[] {
  try {
    const stored = localStorage.getItem(LOGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load logs:', error);
    return [];
  }
}

export function clearLogs(): void {
  try {
    localStorage.removeItem(LOGS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear logs:', error);
  }
}

export function exportLogs(): string {
  const logs = getLogs();
  return JSON.stringify(logs, null, 2);
}
