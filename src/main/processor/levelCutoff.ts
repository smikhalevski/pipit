import { LogMessage, LogProcessor } from '../LoggerChannel.js';
import { type LogLevel, toLevelValue } from '../LogLevel.js';

/**
 * Excludes messages that have an insufficient severity level.
 *
 * @param level The minimum severity level of the message to pass.
 * @returns The processor callback.
 */
export default function levelCutoff(level: LogLevel | number): LogProcessor {
  level = toLevelValue(level);

  const filter = (message: LogMessage) => message.level >= level;

  return (messages, next) => {
    next(messages.every(filter) ? messages : messages.filter(filter));
  };
}
