import { LogProcessor } from '../LoggerChannel.js';
import { LogLevel } from '../LogLevel.js';

/**
 * Prepends args to each message and passes them to the next processor.
 *
 * @returns The processor callback.
 */
export default function stringifyJSON(): LogProcessor {
  return (messages, next) => {
    const timestamp = new Date().toISOString();

    for (const message of messages) {
      message.args = [
        JSON.stringify({
          timestamp,
          level: getLevelLabel(message.level),
          message: message.args[0],
        }),
      ];
    }

    next(messages);
  };
}

function getLevelLabel(level: number): string {
  if (level < LogLevel.DEBUG) {
    return 'trace';
  }
  if (level < LogLevel.INFO) {
    return 'debug';
  }
  if (level < LogLevel.WARN) {
    return 'info ';
  }
  if (level < LogLevel.ERROR) {
    return 'warn ';
  }
  if (level < LogLevel.FATAL) {
    return 'error';
  }
  return 'fatal';
}
