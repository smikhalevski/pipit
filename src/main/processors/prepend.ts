import { LogProcessor } from '../LoggerChannel.js';

/**
 * Prepends args to each message and passes them to the next processor.
 *
 * @param args The args to prepend.
 * @returns The processor callback.
 */
export function prepend(...args: unknown[]): LogProcessor {
  return (messages, next) => {
    for (const message of messages) {
      message.args.unshift(...args);
    }
    next(messages);
  };
}
