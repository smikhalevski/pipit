import { LogMessage, LogProcessor } from '../LoggerChannel';
import { LogLevel } from '../LogLevel';

/**
 * Excludes messages that have an insufficient severity level.
 *
 * @param level The minimum severity level of the message to pass.
 * @returns The processor callback.
 */
export function levelCutoff(level: LogLevel): LogProcessor {
  const filter = (message: LogMessage) => message.level >= level;

  return (messages, next) => {
    next(messages.every(filter) ? messages : messages.filter(filter));
  };
}
