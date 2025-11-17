export const LogLevel = {
  /**
   * Designates finer-grained informational events than the {@link DEBUG}, usually with a stack trace.
   */
  TRACE: 100,

  /**
   * Designates fine-grained informational events that are most useful to debug an application.
   */
  DEBUG: 200,

  /**
   * Designates informational messages that highlight the progress of the application at coarse-grained level.
   */
  INFO: 300,

  /**
   * Designates potentially harmful situations.
   */
  WARN: 400,

  /**
   * Designates error events that might still allow the application to continue running.
   */
  ERROR: 500,

  /**
   * Designates very severe error events that will presumably lead the application to abort.
   */
  FATAL: 600,

  /**
   * The highest possible rank and is intended to turn off logging.
   */
  OFF: Infinity,
} as const;

export type LogLevel = keyof typeof LogLevel;

export function toLevelValue(level: LogLevel | number): number {
  return typeof level === 'number' ? level : LogLevel[level] | 0;
}
