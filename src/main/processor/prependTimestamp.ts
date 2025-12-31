import type { LogProcessor } from '../types.js';
import { dim } from '../utils.js';

export interface PrependTimestampOptions {
  isColorized?: boolean;
}

/**
 * Prepends date and time to each message arguments.
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
  const { isColorized } = options;
  const str = new Date(timestamp).toISOString();

  return (
    (isColorized ? dim(str.substring(0, 10)) : str.substring(0, 10)) +
    ' ' +
    (isColorized ? str.substring(11, 19) + dim(str.substring(19, 23)) : str.substring(11, 23))
  );
}
