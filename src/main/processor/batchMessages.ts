import type { LogMessage, LogProcessor } from '../types.js';

/**
 * Options passed to {@link batchMessages}.
 */
export interface BatchMessagesOptions {
  /**
   * The timeout in milliseconds between the first and the last message in the batchMessages. If -1 then timeout is ignored.
   *
   * @default 100
   */
  timeout?: number;

  /**
   * The maximum number of buffered messages. If -1 then limit is ignored.
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

  let batch: LogMessage[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  let batchNext: any;

  return logger => {
    logger.subscribe(event => {
      if (event.type !== 'flush' || batchNext === undefined || batch.length === 0) {
        return;
      }

      const messages = batch;

      batch = [];
      clearTimeout(timer);

      batchNext(messages);
    });

    return (messages, next) => {
      batchNext = next;

      if (timeout === -1 && limit === -1) {
        next(messages);
        return;
      }

      batch.push(...messages);

      if (limit !== -1 && batch.length >= limit) {
        messages = batch;

        batch = [];
        clearTimeout(timer);

        next(messages);
        return;
      }

      if (timeout === -1 || timer !== undefined) {
        return;
      }

      timer = setTimeout(() => {
        const messages = batch;

        batch = [];
        timer = undefined;

        next(messages);
      }, timeout);
    };
  };
}
