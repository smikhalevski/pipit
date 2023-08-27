import { LogMessage, LogProcessor } from '../LoggerChannel';

/**
 * Options passed to {@link batchMessages}.
 */
export interface BatchOptions {
  /**
   * The timeout in milliseconds between the first and the last message in the batchMessages. If -1 then timeout is ignored.
   *
   * @default 1000
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
export function batchMessages(options: BatchOptions = {}): LogProcessor {
  const { timeout = 1_000, limit = 50 } = options;

  let batch: LogMessage[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (messages, next) => {
    if (timeout === -1 && limit === -1) {
      next(messages);
      return;
    }

    batch.push(...messages);

    if (limit !== -1 && batch.length >= limit) {
      messages = batch;
      batch = [];
      if (timer !== null) {
        clearTimeout(timer);
      }
      next(messages);
      return;
    }

    if (timeout !== -1 && timer === null) {
      timer = setTimeout(() => {
        const messages = batch;
        batch = [];
        timer = null;
        next(messages);
      }, timeout);
    }
  };
}
