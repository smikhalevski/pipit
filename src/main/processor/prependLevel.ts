import { Level } from '../Level.js';
import type { LogProcessor } from '../types.js';
import { bgBlue, bgRed, bgYellow, black, dim, inverse, white } from '../utils.js';

export interface PrependLevelOptions {
  isColorized?: boolean;
}

/**
 * Prepends severity level label to each message.
 *
 * @returns The processor callback.
 */
export default function prependLevel(options: PrependLevelOptions = {}): LogProcessor {
  return () => (messages, next) => {
    for (const message of messages) {
      message.args.unshift(formatLevel(message.level, options));
    }

    next(messages);
  };
}

function formatLevel(level: number, options: PrependLevelOptions): string {
  const { isColorized } = options;

  if (level < Level.DEBUG) {
    return isColorized ? dim(' TRACE ') : 'TRACE';
  }
  if (level < Level.INFO) {
    return isColorized ? bgBlue(white(' DEBUG ')) : 'DEBUG';
  }
  if (level < Level.WARN) {
    return isColorized ? ' INFO  ' : 'INFO ';
  }
  if (level < Level.ERROR) {
    return isColorized ? bgYellow(black(' WARN ')) + ' ' : 'WARN ';
  }
  if (level < Level.FATAL) {
    return isColorized ? bgRed(white(' ERROR ')) : 'ERROR';
  }

  return isColorized ? inverse(' FATAL ') : 'FATAL';
}
