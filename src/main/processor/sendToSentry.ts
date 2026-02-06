import { Level } from '../Level.js';
import type { LogMessage, LogProcessor } from '../types.js';

interface SentryClient {
  captureMessage(message: any, captureOptions?: any): void;

  captureException(message: any, captureOptions?: any): void;
}

/**
 * Options of the {@link sendToSentry} processor.
 */
export interface SendToSentryOptions {
  /**
   * Formats message as a string.
   *
   * By default, the first message argument is stringified.
   *
   * @param message The message to format.
   */
  formatMessage?: (message: LogMessage) => string;

  /**
   * Returns additional capture options for the message.
   *
   * By default, message level and context are extracted.
   *
   * @param message The message to extract options from.
   */
  getAdditionalCaptureOptions?: (message: LogMessage) => object | undefined | void;
}

/**
 * Sends messages to [Sentry](https://sentry.io).
 *
 * Messages with level greater or equal to {@link Level.ERROR} are sent as exceptions. Others are sent as regular
 * messages.
 *
 * @param client The Sentry client.
 * @param options Log processor options.
 * @returns The processor callback.
 */
export default function sendToSentry(client: SentryClient, options: SendToSentryOptions = {}): LogProcessor {
  const { formatMessage, getAdditionalCaptureOptions } = options;

  return () => (messages, next) => {
    for (const message of messages) {
      const messageText = typeof formatMessage === 'function' ? formatMessage(message) : String(message.args[0]);

      const captureOptions = {
        level: formatSentryLevel(message.level),
        context: message.context,
        ...getAdditionalCaptureOptions?.(message),
      };

      if (message.level < Level.ERROR) {
        client.captureMessage(messageText, captureOptions);
        continue;
      }

      const error = message.args[0] instanceof Error ? message.args[0] : new Error(messageText);

      client.captureException(error, captureOptions);
    }

    next(messages);
  };
}

function formatSentryLevel(level: number): string {
  if (level < Level.DEBUG) {
    return 'trace';
  }
  if (level < Level.INFO) {
    return 'debug';
  }
  if (level < Level.WARN) {
    return 'info';
  }
  if (level < Level.ERROR) {
    return 'warning';
  }
  if (level < Level.FATAL) {
    return 'error';
  }
  return 'fatal';
}
