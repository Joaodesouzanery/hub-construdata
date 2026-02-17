/**
 * Logger estruturado para observabilidade.
 *
 * Funcionalidades:
 *   - Níveis: debug, info, warn, error
 *   - Contexto estruturado (module + metadata)
 *   - Timestamps ISO 8601
 *   - Ring buffer para logs recentes (acessível via logger.getRecentLogs())
 *   - Performance tracking (logger.time / logger.timeEnd)
 *   - Configurável via localStorage (log_level)
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  meta?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MAX_BUFFER_SIZE = 200;
const logBuffer: LogEntry[] = [];
const timers = new Map<string, number>();

function getConfiguredLevel(): LogLevel {
  try {
    const stored = localStorage.getItem("log_level");
    if (stored && stored in LOG_LEVELS) return stored as LogLevel;
  } catch { /* SSR or restricted access */ }
  return import.meta.env.DEV ? "debug" : "warn";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getConfiguredLevel()];
}

function formatLog(entry: LogEntry): string {
  const ts = entry.timestamp.slice(11, 23); // HH:MM:SS.mmm
  const prefix = `[${ts}] [${entry.level.toUpperCase().padEnd(5)}] [${entry.module}]`;
  return entry.meta
    ? `${prefix} ${entry.message} ${JSON.stringify(entry.meta)}`
    : `${prefix} ${entry.message}`;
}

function log(level: LogLevel, module: string, message: string, meta?: Record<string, unknown>): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    meta,
  };

  // Ring buffer
  logBuffer.push(entry);
  if (logBuffer.length > MAX_BUFFER_SIZE) logBuffer.shift();

  if (!shouldLog(level)) return;

  const formatted = formatLog(entry);
  switch (level) {
    case "debug": console.debug(formatted); break;
    case "info": console.info(formatted); break;
    case "warn": console.warn(formatted); break;
    case "error": console.error(formatted); break;
  }
}

export const logger = {
  debug: (module: string, message: string, meta?: Record<string, unknown>) =>
    log("debug", module, message, meta),

  info: (module: string, message: string, meta?: Record<string, unknown>) =>
    log("info", module, message, meta),

  warn: (module: string, message: string, meta?: Record<string, unknown>) =>
    log("warn", module, message, meta),

  error: (module: string, message: string, meta?: Record<string, unknown>) =>
    log("error", module, message, meta),

  /** Iniciar timer para medição de performance */
  time: (label: string): void => {
    timers.set(label, performance.now());
  },

  /** Finalizar timer e logar duração */
  timeEnd: (module: string, label: string): number => {
    const start = timers.get(label);
    if (start === undefined) return 0;
    const duration = Math.round(performance.now() - start);
    timers.delete(label);
    log("info", module, `${label} completed`, { durationMs: duration });
    return duration;
  },

  /** Retorna os últimos N logs do ring buffer */
  getRecentLogs: (count = 50): LogEntry[] => {
    return logBuffer.slice(-count);
  },

  /** Retorna logs filtrados por nível */
  getLogsByLevel: (level: LogLevel, count = 50): LogEntry[] => {
    return logBuffer.filter((e) => e.level === level).slice(-count);
  },

  /** Configurar nível de log em runtime */
  setLevel: (level: LogLevel): void => {
    try {
      localStorage.setItem("log_level", level);
    } catch { /* ignore */ }
  },
};
