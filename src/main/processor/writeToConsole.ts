import { Level } from '../Level.js';

import type { LogProcessor } from '../types.js';

/**
 * Writes messages to console.
 */
export default function writeToConsole(): LogProcessor {
  return () => (messages, next) => {
    for (const { level, args } of messages) {
      if (level >= Level.ERROR) {
        console.error(...args);
        continue;
      }
      if (level >= Level.WARN) {
        console.warn(...args);
        continue;
      }
      if (level >= Level.INFO) {
        console.info(...args);
        continue;
      }
      if (level >= Level.DEBUG) {
        console.debug(...args);
        continue;
      }
      if (level >= Level.TRACE) {
        console.trace(...args);
        continue;
      }

      console.log(...args);
    }

    return next(messages);
  };
}
