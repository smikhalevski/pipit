import { Level } from '../Level.js';
import type { LogProcessor } from '../types.js';

/**
 * Squashes message arguments into an object.
 *
 * @returns The processor callback.
 */
export default function stringifyJSON(): LogProcessor {
  return () => (messages, next) => {
    for (const message of messages) {
      const blob: Record<string, unknown> = {
        timestamp: new Date(message.timestamp).toISOString(),
        level: getLevelLabel(message.level),
        message: undefined,
      };

      let text;

      for (const arg of message.args) {
        if (isObject(arg)) {
          Object.assign(blob, arg);
          continue;
        }

        if (typeof arg === 'string' || typeof arg === 'number') {
          text = text === undefined ? arg : String(text) + arg;
        }
      }

      if (text !== '' && blob.message === undefined) {
        blob.message = text;
      }

      if (isObject(message.context)) {
        for (const key in message.context) {
          if (blob[key] === undefined) {
            blob[key] = message.context[key];
          }
        }
      } else {
        blob.context = message.context;
      }

      message.args = [JSON.stringify(blob)];
    }

    next(messages);
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getLevelLabel(level: number): string {
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
    return 'warn';
  }
  if (level < Level.FATAL) {
    return 'error';
  }
  return 'fatal';
}
