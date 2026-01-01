/**
 * Well-known logging levels.
 */
export const Level = {
  /**
   * Designates finer-grained informational events than {@link DEBUG}, usually including a stack trace.
   */
  TRACE: 100,

  /**
   * Designates fine-grained informational events that are most useful for debugging an application.
   */
  DEBUG: 200,

  /**
   * Designates informational messages that highlight the progress of an application at a coarse-grained level.
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
   * The highest possible level; intended to turn off logging.
   */
  OFF: Infinity,
} as const;
