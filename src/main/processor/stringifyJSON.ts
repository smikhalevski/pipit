import { LogProcessor } from '../LoggerChannel.js';
import { Level } from '../Level.js';

/**
 * Prepends args to each message and passes them to the next processor.
 *
 * @returns The processor callback.
 */
export default function stringifyJSON(): LogProcessor {
  return (messages, next) => {
    const timestamp = new Date().toISOString();

    for (const message of messages) {
      message.args = [
        JSON.stringify({
          timestamp,
          level: getLevelLabel(message.level),
          message: message.args[0],
        }),
      ];
    }

    next(messages);
  };
}

function getLevelLabel(level: number): string {
  if (level < Level.DEBUG) {
    return 'trace';
  }
  if (level < Level.INFO) {
    return 'debug';
  }
  if (level < Level.WARN) {
    return 'info ';
  }
  if (level < Level.ERROR) {
    return 'warn ';
  }
  if (level < Level.FATAL) {
    return 'error';
  }
  return 'fatal';
}
