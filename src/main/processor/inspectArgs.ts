import { inspect } from '../inspect.js';
import type { LogProcessor } from '../types.js';

/**
 * Prepends args to each message and passes them to the next processor.
 *
 * @returns The processor callback.
 */
export default function inspectArgs(): LogProcessor {
  return _logger => (messages, next) => {
    for (const message of messages) {
      message.args = message.args.map(arg => inspect(arg));
    }

    next(messages);
  };
}
