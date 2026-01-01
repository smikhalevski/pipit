import { expect, test, vi } from 'vitest';
import { Logger, LogMessage } from '../../main/index.js';
import levelCutoff from '../../main/processor/levelCutoff.js';

test('passes message as is', () => {
  const nextMock = vi.fn();
  const messages: LogMessage[] = [
    { timestamp: 0, level: 111, args: ['aaa'], context: undefined },
    { timestamp: 0, level: 222, args: ['bbb'], context: undefined },
  ];

  levelCutoff(100)(new Logger())(messages, nextMock);

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, messages);
});

test('filter out messages with insufficient level', () => {
  const nextMock = vi.fn();
  const messages: LogMessage[] = [
    { timestamp: 0, level: 111, args: ['aaa'], context: undefined },
    { timestamp: 0, level: 222, args: ['bbb'], context: undefined },
  ];

  levelCutoff(200)(new Logger())(messages, nextMock);

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [{ timestamp: 0, level: 222, args: ['bbb'], context: undefined }]);
});
