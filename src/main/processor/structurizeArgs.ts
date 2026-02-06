import type { LogMessage, LogProcessor } from '../types.js';
import { Level } from '../Level.js';

/**
 * Options passed to {@link structurizeArgs}.
 */
export interface StructurizeArgsOptions {
  /**
   * Formats timestamp before adding it to the payload.
   *
   * By default, convers timestamp to {@link Date}.
   *
   * @param timestamp The timestamp to format.
   */
  formatTimestamp?: (timestamp: number) => unknown;

  /**
   * Foramts message level.
   *
   * By default, converts level to string "info", "debug", etc.
   *
   * @param level The level to format.
   */
  formatLevel?: (level: number) => unknown;

  /**
   * Returns the additional logged payload for the message.
   *
   * @param message The message to extract payload from.
   */
  getAdditionalPayload?: (message: LogMessage) => object | undefined | void;
}

/**
 * Replaces message arguments with a single object that includes timestamp, level, messge text, optional stack trace
 * and context.
 *
 * @param options Stringification options.
 * @returns The processor callback.
 */
export default function structurizeArgs(options: StructurizeArgsOptions = {}): LogProcessor {
  const { formatTimestamp = formatTimestampAsDate, formatLevel = formatLevelAsLabel, getAdditionalPayload } = options;

  return () => (messages, next) => {
    for (const message of messages) {
      const args0 = message.args[0];

      message.args = [
        {
          timestamp: formatTimestamp(message.timestamp),
          level: formatLevel(message.level),
          ...message.context,
          message: typeof args0 === 'string' ? args0 : args0 instanceof Error ? args0.message : undefined,
          stackTrace: args0 instanceof Error ? args0.stack : undefined,
          ...getAdditionalPayload?.(message),
        },
      ];
    }

    next(messages);
  };
}

function formatTimestampAsDate(timestamp: number): Date {
  return new Date(timestamp);
}

function formatLevelAsLabel(level: number): string {
  if (level < Level.DEBUG) {
    return 'trace';
  }
  if (level < Level.INFO) {
    return 'debug';
  }
  if (level < Level.WARN) {
    return 'info';
  }
  if (level < Level.ERROR) {
    return 'warn';
  }
  if (level < Level.FATAL) {
    return 'error';
  }
  return 'fatal';
}
