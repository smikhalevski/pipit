import { expect, test, vi } from 'vitest';
import batchMessages from '../../main/processor/batchMessages.js';

vi.useFakeTimers();

test('batches messages using limit strategy', () => {
  const nextMock = vi.fn();
  const processor = batchMessages({ timeout: -1, limit: 2 });

  processor([{ level: 0, args: ['aaa'], context: undefined }], nextMock);

  expect(nextMock).not.toHaveBeenCalled();

  processor([{ level: 0, args: ['bbb'], context: undefined }], nextMock);

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    { level: 0, args: ['aaa'], context: undefined },
    { level: 0, args: ['bbb'], context: undefined },
  ]);
});

test('batches messages using timeout strategy', () => {
  const nextMock = vi.fn();
  const processor = batchMessages({ timeout: 10, limit: -1 });

  processor([{ level: 0, args: ['aaa'], context: undefined }], nextMock);

  expect(nextMock).not.toHaveBeenCalled();

  processor([{ level: 0, args: ['bbb'], context: undefined }], nextMock);

  expect(nextMock).not.toHaveBeenCalled();

  vi.runAllTimers();

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    { args: ['aaa'], context: undefined, level: 0 },
    { args: ['bbb'], context: undefined, level: 0 },
  ]);
});
