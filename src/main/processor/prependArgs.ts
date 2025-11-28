import type { LogProcessor } from '../types.js';

/**
 * Prepends args to each message and passes them to the next processor.
 *
 * @param args The args to prependArgs.
 * @returns The processor callback.
 */
export default function prependArgs(...args: unknown[]): LogProcessor {
  return _logger => (messages, next) => {
    for (const message of messages) {
      message.args.unshift(...args);
    }
    next(messages);
  };
}
