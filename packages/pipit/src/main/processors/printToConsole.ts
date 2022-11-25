import { LogLevel } from '../LogLevel';
import { LogProcessor } from '../LoggerChannel';

/**
 * Prints messages to console.
 *
 * @returns The processor callback.
 */
export function printToConsole(): LogProcessor {
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
      if (level < LogLevel.DEBUG) {
        console.trace(...args);
        continue;
      }
      if (level < LogLevel.INFO) {
        console.debug(...args);
        continue;
      }
      console.log(...args);
    }

    return next(messages);
  };
}
