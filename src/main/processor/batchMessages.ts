import type { LogMessage, LogProcessor } from '../types.js';

/**
 * Options passed to {@link batchMessages}.
 */
export interface BatchMessagesOptions {
  /**
   * The timeout in milliseconds between the first and the last message in the batchMessages.
   *
   * If < 0 then no batching is done.
   *
   * @default 100
   */
  timeout?: number;

  /**
   * The maximum number of buffered messages.
   *
   * If < 2 then no batching is done.
   *
   * @default 50
   */
  limit?: number;
}

/**
 * Batches messages in a timeframe or until a certain number of messages is dispatched.
 *
 * @param options Batching options.
 * @returns The processor callback.
 */
export default function batchMessages(options: BatchMessagesOptions = {}): LogProcessor {
  const { timeout = 100, limit = 50 } = options;

  if (timeout < 0 || limit < 2) {
    return () => (messages, next) => next(messages);
  }

  return logger => {
    let cachedMessages: LogMessage[] = [];
    let cachedNext: ((messages: LogMessage[]) => void) | undefined;
    let timer: number | undefined;

    const flush = (): void => {
      const messages = cachedMessages;
      const next = cachedNext;

      clearTimeout(timer);
      cachedNext = timer = undefined;

      cachedMessages = [];
      next?.(messages);
    };

    logger.subscribe(event => {
      if (event.type === 'flush' || event.type === 'reset') {
        flush();
      }
    });

    return (messages, next) => {
      cachedMessages.push(...messages);
      cachedNext = next;

      if (cachedMessages.length >= limit) {
        flush();
      } else if (timer === undefined) {
        timer = setTimeout(flush, timeout);
      }
    };
  };
}
