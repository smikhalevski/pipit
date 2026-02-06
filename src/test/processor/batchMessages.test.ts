import { expect, test, vi } from 'vitest';
import batchMessages from '../../main/processor/batchMessages.js';
import { Logger } from '../../main/index.js';

vi.useFakeTimers();

test('batches messages using limit strategy', () => {
  const nextMock = vi.fn();
  const handler = batchMessages({ timeout: 0, limit: 2 })(new Logger());

  handler([{ timestamp: 0, level: 0, args: ['aaa'], context: undefined }], nextMock);

  expect(nextMock).not.toHaveBeenCalled();

  handler([{ timestamp: 0, level: 0, args: ['bbb'], context: undefined }], nextMock);

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    { timestamp: 0, level: 0, args: ['aaa'], context: undefined },
    { timestamp: 0, level: 0, args: ['bbb'], context: undefined },
  ]);
});

test('batches messages using timeout strategy', () => {
  const nextMock = vi.fn();
  const handler = batchMessages({ timeout: 10, limit: Infinity })(new Logger());

  handler([{ timestamp: 0, level: 0, args: ['aaa'], context: undefined }], nextMock);

  expect(nextMock).not.toHaveBeenCalled();

  handler([{ timestamp: 0, level: 0, args: ['bbb'], context: undefined }], nextMock);

  expect(nextMock).not.toHaveBeenCalled();

  vi.runAllTimers();

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    { timestamp: 0, level: 0, args: ['aaa'], context: undefined },
    { timestamp: 0, level: 0, args: ['bbb'], context: undefined },
  ]);
});

test('flushes messages on demand', () => {
  const nextMock = vi.fn();
  const logger = new Logger();
  const handler = batchMessages({ timeout: 10, limit: Infinity })(logger);

  handler([{ timestamp: 0, level: 0, args: ['aaa'], context: undefined }], nextMock);

  expect(nextMock).not.toHaveBeenCalled();

  handler([{ timestamp: 0, level: 0, args: ['bbb'], context: undefined }], nextMock);

  expect(nextMock).not.toHaveBeenCalled();

  logger.flush();

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    { timestamp: 0, level: 0, args: ['aaa'], context: undefined },
    { timestamp: 0, level: 0, args: ['bbb'], context: undefined },
  ]);
});

test('flushes messages if the logger is reset', () => {
  const nextMock = vi.fn();
  const logger = new Logger();
  const handler = batchMessages({ timeout: 10, limit: Infinity })(logger);

  handler([{ timestamp: 0, level: 0, args: ['aaa'], context: undefined }], nextMock);

  expect(nextMock).not.toHaveBeenCalled();

  handler([{ timestamp: 0, level: 0, args: ['bbb'], context: undefined }], nextMock);

  expect(nextMock).not.toHaveBeenCalled();

  logger.reset();

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    { timestamp: 0, level: 0, args: ['aaa'], context: undefined },
    { timestamp: 0, level: 0, args: ['bbb'], context: undefined },
  ]);
});
