import { expect, test, vi } from 'vitest';
import { Logger, LogMessage } from '../../main/index.js';
import prependArgs from '../../main/processor/prependArgs.js';

test('prepends args to each message', () => {
  const nextMock = vi.fn();
  const messages: LogMessage[] = [
    { timestamp: 0, level: 111, args: ['aaa'], context: undefined },
    { timestamp: 0, level: 222, args: ['bbb'], context: undefined },
  ];

  prependArgs('ccc')(new Logger())(messages, nextMock);

  expect(messages[0].args).toEqual(['ccc', 'aaa']);
  expect(messages[1].args).toEqual(['ccc', 'bbb']);
  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, messages);
});
