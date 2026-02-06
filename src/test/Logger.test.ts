import { expect, test, vi } from 'vitest';
import { Level, Logger } from '../main/index.js';

vi.useFakeTimers();
vi.setSystemTime(new Date('2026-01-01T14:01:13.322Z'));

test('creates a new logger', () => {
  const logger = new Logger();

  expect(logger.level).toBe(0);
  expect(logger.context).toBe(undefined);
  expect(logger['_channels'].length).toBe(0);
  expect(logger.isTraceEnabled).toBe(true);
  expect(logger.isDebugEnabled).toBe(true);
  expect(logger.isInfoEnabled).toBe(true);
  expect(logger.isWarnEnabled).toBe(true);
  expect(logger.isErrorEnabled).toBe(true);
  expect(logger.isFatalEnabled).toBe(true);
});

test('creates a new logger with a log level', () => {
  const logger = new Logger(Level.ERROR);

  expect(logger.level).toBe(Level.ERROR);
  expect(logger.context).toBe(undefined);
  expect(logger['_channels'].length).toBe(0);
  expect(logger.isTraceEnabled).toBe(false);
  expect(logger.isDebugEnabled).toBe(false);
  expect(logger.isInfoEnabled).toBe(false);
  expect(logger.isWarnEnabled).toBe(false);
  expect(logger.isErrorEnabled).toBe(true);
  expect(logger.isFatalEnabled).toBe(true);
});

test('dispatches an info message', () => {
  const handlerMock = vi.fn();
  const { info } = new Logger().addChannel(() => handlerMock);

  info('aaa', 'bbb');

  expect(handlerMock).toHaveBeenCalledTimes(1);
  expect(handlerMock).toHaveBeenNthCalledWith(
    1,
    [
      {
        timestamp: 1767276073322,
        level: Level.INFO,
        args: ['aaa', 'bbb'],
        context: undefined,
      },
    ],
    expect.any(Function)
  );
});

test('adds a channel with a single processor', () => {
  const handlerMock = vi.fn();
  const processorMock = vi.fn(() => handlerMock);

  const logger = new Logger();

  logger.addChannel(processorMock);

  expect(processorMock).toHaveBeenCalledTimes(1);
  expect(processorMock).toHaveBeenNthCalledWith(1, logger);

  logger.info('aaa');

  expect(handlerMock).toHaveBeenCalledTimes(1);
  expect(handlerMock).toHaveBeenNthCalledWith(
    1,
    [{ timestamp: 1767276073322, level: Level.INFO, args: ['aaa'], context: undefined }],
    expect.any(Function)
  );
});

test('adds a channel with multiple processors', () => {
  const handlerMock1 = vi.fn((messages, next) =>
    next(messages.concat({ timestamp: 0, level: 111, args: ['bbb'], context: 222 }))
  );
  const processorMock1 = vi.fn(() => handlerMock1);

  const handlerMock2 = vi.fn();
  const processorMock2 = vi.fn(() => handlerMock2);

  const logger = new Logger();

  logger.addChannel(processorMock1, processorMock2);

  expect(processorMock1).toHaveBeenCalledTimes(1);
  expect(processorMock1).toHaveBeenNthCalledWith(1, logger);

  expect(processorMock2).toHaveBeenCalledTimes(1);
  expect(processorMock2).toHaveBeenNthCalledWith(1, logger);

  logger.info('aaa');

  expect(handlerMock1).toHaveBeenCalledTimes(1);
  expect(handlerMock1).toHaveBeenNthCalledWith(
    1,
    [{ timestamp: 1767276073322, level: Level.INFO, args: ['aaa'], context: undefined }],
    expect.any(Function)
  );

  expect(handlerMock2).toHaveBeenCalledTimes(1);
  expect(handlerMock2).toHaveBeenNthCalledWith(
    1,
    [
      { timestamp: 1767276073322, level: Level.INFO, args: ['aaa'], context: undefined },
      { timestamp: 0, level: 111, args: ['bbb'], context: 222 },
    ],
    expect.any(Function)
  );
});

test('dispatches message to all channels', () => {
  const handlerMock1 = vi.fn();
  const handlerMock2 = vi.fn();
  const logger = new Logger();

  logger.addChannel(() => handlerMock1);
  logger.addChannel(() => handlerMock2);

  logger.info('aaa');

  expect(handlerMock1).toHaveBeenCalledTimes(1);
  expect(handlerMock1).toHaveBeenNthCalledWith(
    1,
    [{ timestamp: 1767276073322, level: Level.INFO, args: ['aaa'], context: undefined }],
    expect.any(Function)
  );
  expect(handlerMock2).toHaveBeenCalledTimes(1);
  expect(handlerMock2).toHaveBeenNthCalledWith(
    1,
    [{ timestamp: 1767276073322, level: Level.INFO, args: ['aaa'], context: undefined }],
    expect.any(Function)
  );
});

test('does not dispatch message if level is insufficient', () => {
  const handlerMock = vi.fn();
  const logger = new Logger(Level.ERROR);

  logger.addChannel(() => handlerMock);

  logger.info('aaa');

  expect(handlerMock).not.toHaveBeenCalled();

  logger.error('bbb');

  expect(handlerMock).toHaveBeenCalledTimes(1);
});

test('attaches logger context', () => {
  const handlerMock = vi.fn();
  const logger = new Logger();

  logger.context = { ppp: 'qqq' };

  logger.addChannel(() => handlerMock);

  logger.info('aaa');

  expect(handlerMock).toHaveBeenCalledTimes(1);
  expect(handlerMock).toHaveBeenNthCalledWith(
    1,
    [{ timestamp: 1767276073322, level: Level.INFO, args: ['aaa'], context: { ppp: 'qqq' } }],
    expect.any(Function)
  );
});

test('invokes all channels even if an error is thrown', () => {
  const handlerMock1 = vi.fn(() => {
    throw new Error('expected1');
  });
  const handlerMock2 = vi.fn(() => {
    throw new Error('expected2');
  });
  const logger = new Logger();

  logger.addChannel(() => handlerMock1);
  logger.addChannel(() => handlerMock2);

  expect(() => logger.info('aaa')).not.toThrow();

  expect(handlerMock1).toHaveBeenCalledTimes(1);
  expect(handlerMock2).toHaveBeenCalledTimes(1);

  expect(() => vi.runAllTimers()).toThrow(new Error('expected1'));
});

test('does not fail if there are no channels', () => {
  new Logger().info('aaa');
});
