import { LogProcessor } from '../LoggerChannel';

/**
 * Prepends date and time in ISO format to each message.
 *
 * @returns The processor callback.
 */
export function prependDateTime(): LogProcessor {
  return (messages, next) => {
    const date = new Date().toISOString();

    for (const message of messages) {
      message.args.unshift(date);
    }

    next(messages);
  };
}
