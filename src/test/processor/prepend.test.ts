import { expect, test, vi } from 'vitest';
import { LogMessage } from '../../main/index.js';
import prepend from '../../main/processor/prepend.js';

test('prepends args to each message', () => {
  const nextMock = vi.fn();
  const messages: LogMessage[] = [
    { level: 111, args: ['aaa'], context: undefined },
    { level: 222, args: ['bbb'], context: undefined },
  ];

  prepend('ccc')(messages, nextMock);

  expect(messages[0].args).toEqual(['ccc', 'aaa']);
  expect(messages[1].args).toEqual(['ccc', 'bbb']);
  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, messages);
});
