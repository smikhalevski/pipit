import { LogProcessor } from '../LoggerChannel.js';

/**
 * Prepends date and time in ISO format to each message.
 *
 * @returns The processor callback.
 */
export default function prependDateTime(): LogProcessor {
  return (messages, next) => {
    const date = new Date().toISOString();

    for (const message of messages) {
      message.args.unshift(date);
    }

    next(messages);
  };
}
