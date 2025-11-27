import { Level } from '../Level.js';
import type { LogProcessor } from '../types.js';

/**
 * Prepends severity level label to each message.
 *
 * @returns The processor callback.
 */
export default function prependLevel(): LogProcessor {
  return (messages, next) => {
    for (const message of messages) {
      message.args.unshift(getLevelLabel(message.level));
    }

    next(messages);
  };
}

function getLevelLabel(level: number): string {
  if (level < Level.DEBUG) {
    return 'TRACE';
  }
  if (level < Level.INFO) {
    return 'DEBUG';
  }
  if (level < Level.WARN) {
    return 'INFO ';
  }
  if (level < Level.ERROR) {
    return 'WARN ';
  }
  if (level < Level.FATAL) {
    return 'ERROR';
  }
  return 'FATAL';
}
