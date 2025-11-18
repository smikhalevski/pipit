import { LogLevel } from '../LogLevel.js';
import { LogProcessor } from '../LoggerChannel.js';

/**
 * Writes messages to console.
 */
export default function writeToConsole(): LogProcessor {
  return (messages, next) => {
    for (const { level, args } of messages) {
      if (level >= LogLevel.ERROR) {
        console.error(...args);
        continue;
      }
      if (level >= LogLevel.WARN) {
        console.warn(...args);
        continue;
      }
      if (level >= LogLevel.INFO) {
        console.info(...args);
        continue;
      }
      if (level >= LogLevel.DEBUG) {
        console.debug(...args);
        continue;
      }
      if (level >= LogLevel.TRACE) {
        console.trace(...args);
        continue;
      }

      console.log(...args);
    }

    return next(messages);
  };
}
