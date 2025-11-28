import type { LogProcessor } from '../types.js';

/**
 * Prepends date and time in ISO format to each message.
 *
 * @returns The processor callback.
 */
export default function prependTimestamp(): LogProcessor {
  return _logger => (messages, next) => {
    const timestamp = new Date().toISOString();

    for (const message of messages) {
      message.args.unshift(timestamp);
    }

    next(messages);
  };
}
