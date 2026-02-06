import type { LogProcessor } from '../types.js';
import { dim } from '../utils.js';

/**
 * Options passed to {@link prependTimestamp}.
 */
export interface PrependTimestampOptions {
  /**
   * If `true` then date and milliseconds are rednered in dimmed color.
   *
   * @default false
   */
  isColorized?: boolean;

  /**
   * If `true` then date is not rendered.
   *
   * @default false
   */
  noDate?: boolean;

  /**
   * If `true` then milliseconds are not rendered.
   *
   * @default false
   */
  noMilliseconds?: boolean;
}

/**
 * Prepends date and time to arguments of a message.
 *
 * @returns The processor callback.
 */
export default function prependTimestamp(options: PrependTimestampOptions = {}): LogProcessor {
  return () => (messages, next) => {
    for (const message of messages) {
      message.args.unshift(formatTimestamp(message.timestamp, options));
    }

    next(messages);
  };
}

function formatTimestamp(timestamp: number, options: PrependTimestampOptions): string {
  const { isColorized, noDate, noMilliseconds } = options;
  const str = new Date(timestamp).toISOString();

  const dateStr = str.substring(0, 10);
  const timeStr = str.substring(11, 19);
  const msecStr = str.substring(19, 23);

  return (
    (noDate ? '' : (isColorized ? dim(dateStr) : dateStr) + ' ') +
    timeStr +
    (noMilliseconds ? '' : isColorized ? dim(msecStr) : msecStr)
  );
}
