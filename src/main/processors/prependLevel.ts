import { LogProcessor } from '../LoggerChannel.js';
import { LogLevel } from '../LogLevel.js';

/**
 * Prepends severity level label to each message.
 *
 * @returns The processor callback.
 */
export function prependLevel(): LogProcessor {
  return (messages, next) => {
    for (const message of messages) {
      message.args.unshift(getLevelLabel(message.level));
    }

    next(messages);
  };
}

function getLevelLabel(level: number): string {
  if (level < LogLevel.DEBUG) {
    return 'TRACE';
  }
  if (level < LogLevel.INFO) {
    return 'DEBUG';
  }
  if (level < LogLevel.WARN) {
    return 'INFO ';
  }
  if (level < LogLevel.ERROR) {
    return 'WARN ';
  }
  if (level < LogLevel.FATAL) {
    return 'ERROR';
  }
  return 'FATAL';
}
