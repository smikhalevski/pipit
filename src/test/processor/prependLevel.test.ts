import { expect, test, vi } from 'vitest';
import { Level, Logger, LogMessage } from '../../main/index.js';
import prependLevel from '../../main/processor/prependLevel.js';

test('prepends level to each message', () => {
  const nextMock = vi.fn();
  const messages: LogMessage[] = [
    { timestamp: 0, level: Level.WARN, args: ['aaa'], context: undefined },
    { timestamp: 0, level: Level.DEBUG, args: ['bbb'], context: undefined },
  ];

  prependLevel()(new Logger())(messages, nextMock);

  expect(messages[0].args).toEqual(['WARN ', 'aaa']);
  expect(messages[1].args).toEqual(['DEBUG', 'bbb']);
  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, messages);
});

test('prepends colorized level', () => {
  const nextMock = vi.fn();
  const messages: LogMessage[] = [
    { timestamp: 0, level: Level.ERROR, args: ['aaa'], context: undefined },
    { timestamp: 0, level: Level.FATAL, args: ['bbb'], context: undefined },
    { timestamp: 0, level: Level.INFO, args: ['ccc'], context: undefined },
  ];

  prependLevel({ isColorized: true })(new Logger())(messages, nextMock);

  expect(messages[0].args).toEqual(['[41m[37m ERROR [39m[49m', 'aaa']);
  expect(messages[1].args).toEqual(['[7m FATAL [27m', 'bbb']);
  expect(messages[2].args).toEqual([' INFO  ', 'ccc']);
  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, messages);
});
