import { expect, test, vi } from 'vitest';
import { Logger, LoggerChannel, LogLevel } from '../main/index.js';

vi.useFakeTimers();

test('creates a new logger', () => {
  const logger = new Logger();

  expect(logger.level).toBe(0);
  expect(logger.context).toBe(undefined);
  expect(logger.channels.length).toBe(0);
  expect(logger.isTraceEnabled).toBe(true);
  expect(logger.isDebugEnabled).toBe(true);
  expect(logger.isInfoEnabled).toBe(true);
  expect(logger.isWarnEnabled).toBe(true);
  expect(logger.isErrorEnabled).toBe(true);
  expect(logger.isFatalEnabled).toBe(true);
});

test('creates a new logger with a log level', () => {
  const logger = new Logger(LogLevel.ERROR);

  expect(logger.level).toBe(LogLevel.ERROR);
  expect(logger.context).toBe(undefined);
  expect(logger.channels.length).toBe(0);
  expect(logger.isTraceEnabled).toBe(false);
  expect(logger.isDebugEnabled).toBe(false);
  expect(logger.isInfoEnabled).toBe(false);
  expect(logger.isWarnEnabled).toBe(false);
  expect(logger.isErrorEnabled).toBe(true);
  expect(logger.isFatalEnabled).toBe(true);
});

test('appends a channel', () => {
  const logger = new Logger();

  const channel1 = logger.openChannel();
  const channel2 = logger.openChannel();

  expect(channel1).toBeInstanceOf(LoggerChannel);
  expect(channel2).toBeInstanceOf(LoggerChannel);

  expect(logger.channels.length).toBe(2);
  expect(logger.channels[0]).toBe(channel1);
  expect(logger.channels[1]).toBe(channel2);
});

test('dispatches an info message', () => {
  const logger = new Logger();
  const dispatchSpy = vi.spyOn(logger, 'dispatch');

  logger.info('aaa', 'bbb');

  expect(dispatchSpy).toHaveBeenCalledTimes(1);
  expect(dispatchSpy).toHaveBeenNthCalledWith(1, LogLevel.INFO, ['aaa', 'bbb']);
});

test('info is bound to logger', () => {
  const logger = new Logger();
  const dispatchSpy = vi.spyOn(logger, 'dispatch');

  const info = logger.info;

  info('aaa', 'bbb');

  expect(dispatchSpy).toHaveBeenCalledTimes(1);
  expect(dispatchSpy).toHaveBeenNthCalledWith(1, LogLevel.INFO, ['aaa', 'bbb']);
});

test('dispatches message to all channels', () => {
  const processorMock1 = vi.fn();
  const processorMock2 = vi.fn();
  const logger = new Logger();

  logger.openChannel().to(processorMock1);
  logger.openChannel().to(processorMock2);

  logger.info('aaa');

  expect(processorMock1).toHaveBeenCalledTimes(1);
  expect(processorMock1).toHaveBeenNthCalledWith(
    1,
    [{ level: LogLevel.INFO, args: ['aaa'], context: undefined }],
    expect.any(Function)
  );
  expect(processorMock2).toHaveBeenCalledTimes(1);
  expect(processorMock2).toHaveBeenNthCalledWith(
    1,
    [{ level: LogLevel.INFO, args: ['aaa'], context: undefined }],
    expect.any(Function)
  );
});

test('does not dispatch message if level is insufficient', () => {
  const processorMock = vi.fn();
  const logger = new Logger(LogLevel.ERROR);

  logger.openChannel().to(processorMock);

  logger.info('aaa');

  expect(processorMock).not.toHaveBeenCalled();

  logger.error('bbb');

  expect(processorMock).toHaveBeenCalledTimes(1);
});

test('attaches logger context', () => {
  const processorMock = vi.fn();
  const logger = new Logger();

  logger.context = 111;

  logger.openChannel().to(processorMock);

  logger.info('aaa');

  expect(processorMock).toHaveBeenCalledTimes(1);
  expect(processorMock).toHaveBeenNthCalledWith(
    1,
    [{ level: LogLevel.INFO, args: ['aaa'], context: 111 }],
    expect.any(Function)
  );
});

test('invokes all channels and re-throws the first error', () => {
  const processorMock1 = vi.fn(() => {
    throw new Error('expected1');
  });
  const processorMock2 = vi.fn(() => {
    throw new Error('expected2');
  });
  const logger = new Logger();

  logger.openChannel().to(processorMock1);
  logger.openChannel().to(processorMock2);

  expect(() => logger.info('aaa')).not.toThrow();

  expect(processorMock1).toHaveBeenCalledTimes(1);
  expect(processorMock2).toHaveBeenCalledTimes(1);

  expect(() => vi.runAllTimers()).toThrow(new Error('expected1'));
});
