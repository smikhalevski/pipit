import { LogLevel, LogProcessor } from 'pipit';
import { Client } from '@sentry/types';

/**
 * Sends messages to [Sentry](https://sentry.io).
 *
 * Messages with level greater or equal to `LogLevel.ERROR` are sent as exceptions. Others are sent as regular messages.
 *
 * @param client The Sentry client.
 * @returns The processor callback.
 */
export function sendToSentry(client: Pick<Client, 'captureMessage' | 'captureException'>): LogProcessor {
  return (messages, next) => {
    for (const message of messages) {
      if (message.level >= LogLevel.ERROR) {
        client.captureException(message.args[0]);
      } else {
        client.captureMessage(message.args[0]);
      }
    }
    next(messages);
  };
}
