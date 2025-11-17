import { expect, test, vi } from 'vitest';
import { LogMessage } from '../../main/index.js';
import levelCutoff from '../../main/processor/levelCutoff.js';

test('passes message as is', () => {
  const nextMock = vi.fn();
  const messages: LogMessage[] = [
    { level: 111, args: ['aaa'], context: undefined },
    { level: 222, args: ['bbb'], context: undefined },
  ];

  levelCutoff(100)(messages, nextMock);

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, messages);
});

test('filter out messages with insufficient level', () => {
  const nextMock = vi.fn();
  const messages: LogMessage[] = [
    { level: 111, args: ['aaa'], context: undefined },
    { level: 222, args: ['bbb'], context: undefined },
  ];

  levelCutoff(200)(messages, nextMock);

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [{ level: 222, args: ['bbb'], context: undefined }]);
});
