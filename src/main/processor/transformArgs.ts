import type { LogMessage, LogProcessor } from '../types.js';

/**
 * Transforms message arguments before passing it to the next processor.
 *
 * @param callback The callback that receives a message and returns its transformed arguments.
 * @returns The processor callback.
 */
export default function transformArgs(callback: (message: LogMessage) => any[]): LogProcessor {
  return () => (messages, next) => {
    for (const message of messages) {
      message.args = callback(message);
    }
    next(messages);
  };
}
