import { expect, test, vi } from 'vitest';
import { Logger, LogMessage } from '../../main/index.js';
import stringifyAsJSON from '../../main/processor/stringifyAsJSON.js';

test('stringifies the first message argument as JSON', () => {
  const nextMock = vi.fn();
  const messages: LogMessage[] = [
    { timestamp: 0, level: 111, args: [{ xxx: 'yyy' }, { ppp: 'qqq' }], context: undefined },
  ];

  stringifyAsJSON()(new Logger())(messages, nextMock);

  expect(messages[0].args).toEqual(['{"xxx":"yyy"}']);
  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, messages);
});
