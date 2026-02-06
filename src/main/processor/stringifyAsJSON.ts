import type { LogProcessor } from '../types.js';

/**
 * Replaces message arguments with a JSON-stringified value of the first argument.
 *
 * @param replacer The replacer passed to the {@link JSON.stringify}.
 * @returns The processor callback.
 */
export default function stringifyAsJSON(replacer?: (this: any, key: string, value: any) => any): LogProcessor {
  return () => (messages, next) => {
    for (const message of messages) {
      message.args = [JSON.stringify(message.args[0], replacer)];
    }
    next(messages);
  };
}
