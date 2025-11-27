import { Level } from '../Level.js';
import type { LogProcessor } from '../types.js';

interface SentryClient {
  captureMessage(message: any): void;

  captureException(message: any): void;
}

/**
 * Sends messages to [Sentry](https://sentry.io).
 *
 * Messages with level greater or equal to {@link Level.ERROR} are sent as exceptions. Others are sent as regular
 * messages.
 *
 * @param client The Sentry client.
 * @returns The processor callback.
 */
export default function sendToSentry(client: SentryClient): LogProcessor {
  return (messages, next) => {
    for (const message of messages) {
      if (message.level >= Level.ERROR) {
        client.captureException(message.args[0]);
      } else {
        client.captureMessage(message.args[0]);
      }
    }
    next(messages);
  };
}
