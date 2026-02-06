import { expect, test, vi } from 'vitest';
import { Level, Logger, LogMessage } from '../../main/index.js';
import transformArgs from '../../main/processor/transformArgs.js';

test('transforms args of each message', () => {
  const nextMock = vi.fn();
  const callbackMock = vi.fn().mockReturnValueOnce(['xxx']).mockReturnValueOnce(['yyy']);

  const messages: LogMessage[] = [
    { timestamp: 0, level: Level.WARN, args: ['aaa'], context: undefined },
    { timestamp: 0, level: Level.DEBUG, args: ['bbb'], context: undefined },
  ];

  transformArgs(callbackMock)(new Logger())(messages, nextMock);

  expect(messages[0].args).toEqual(['xxx']);
  expect(messages[1].args).toEqual(['yyy']);
  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, messages);
});
