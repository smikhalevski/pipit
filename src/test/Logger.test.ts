import { expect, test, vi } from 'vitest';
import { Level, Logger } from '../main/index.js';

vi.useFakeTimers();

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

// test('dispatches an info message', () => {
//   const logger = new Logger();
//   const dispatchSpy = vi.spyOn(logger, '_dispatch');
//
//   logger.info('aaa', 'bbb');
//
//   expect(dispatchSpy).toHaveBeenCalledTimes(1);
//   expect(dispatchSpy).toHaveBeenNthCalledWith(1, Level.INFO, ['aaa', 'bbb']);
// });

// test('info is bound to logger', () => {
//   const logger = new Logger();
//   const dispatchSpy = vi.spyOn(logger, '_dispatch');
//
//   const info = logger.info;
//
//   info('aaa', 'bbb');
//
//   expect(dispatchSpy).toHaveBeenCalledTimes(1);
//   expect(dispatchSpy).toHaveBeenNthCalledWith(1, Level.INFO, ['aaa', 'bbb']);
// });

test('dispatches message to all channels', () => {
  const processorMock1 = vi.fn();
  const processorMock2 = vi.fn();
  const logger = new Logger();

  logger.addChannel(processorMock1);
  logger.addChannel(processorMock2);

  logger.info('aaa');

  expect(processorMock1).toHaveBeenCalledTimes(1);
  expect(processorMock1).toHaveBeenNthCalledWith(
    1,
    [{ level: Level.INFO, args: ['aaa'], context: undefined }],
    expect.any(Function)
  );
  expect(processorMock2).toHaveBeenCalledTimes(1);
  expect(processorMock2).toHaveBeenNthCalledWith(
    1,
    [{ level: Level.INFO, args: ['aaa'], context: undefined }],
    expect.any(Function)
  );
});

test('does not dispatch message if level is insufficient', () => {
  const processorMock = vi.fn();
  const logger = new Logger(Level.ERROR);

  logger.addChannel(processorMock);

  logger.info('aaa');

  expect(processorMock).not.toHaveBeenCalled();

  logger.error('bbb');

  expect(processorMock).toHaveBeenCalledTimes(1);
});

test('attaches logger context', () => {
  const processorMock = vi.fn();
  const logger = new Logger();

  logger.context = 111;

  logger.addChannel(processorMock);

  logger.info('aaa');

  expect(processorMock).toHaveBeenCalledTimes(1);
  expect(processorMock).toHaveBeenNthCalledWith(
    1,
    [{ level: Level.INFO, args: ['aaa'], context: 111 }],
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

  logger.addChannel(processorMock1);
  logger.addChannel(processorMock2);

  expect(() => logger.info('aaa')).not.toThrow();

  expect(processorMock1).toHaveBeenCalledTimes(1);
  expect(processorMock2).toHaveBeenCalledTimes(1);

  expect(() => vi.runAllTimers()).toThrow(new Error('expected1'));
});

test('does not fail if there are no processors', () => {
  new Logger()['_dispatch'](0, ['aaa']);
});

test('does not fail if the last processor invokes next', () => {
  const logger = new Logger().addChannel(() => (messages, next) => {
    next(messages);
  });

  logger['_dispatch'](0, ['aaa']);
});

test('invokes a processor', () => {
  const logger = new Logger();
  const processorMock = vi.fn();

  logger.addChannel(processorMock);

  logger['_dispatch'](0, ['aaa']);

  expect(processorMock).toHaveBeenCalledTimes(1);
  expect(processorMock).toHaveBeenNthCalledWith(
    1,
    [{ level: 0, args: ['aaa'], context: undefined }],
    expect.any(Function)
  );
});

// test('invokes another channel', () => {
//   const channel1 = new LoggerChannel();
//   const channel2 = new LoggerChannel();
//   const processorMock = vi.fn();
//
//   const dispatchSpy = vi.spyOn(channel2, 'dispatch');
//
//   channel1.to(channel2).to(processorMock);
//
//   channel1.dispatch(0, ['aaa'], 111);
//
//   expect(dispatchSpy).toHaveBeenCalledTimes(1);
//   expect(dispatchSpy).toHaveBeenNthCalledWith(1, 0, ['aaa'], 111);
//   expect(processorMock).toHaveBeenCalledTimes(1);
//   expect(processorMock).toHaveBeenNthCalledWith(1, [{ level: 0, args: ['aaa'], context: 111 }], expect.any(Function));
// });
//
// test('a processor can invoke the next processor', () => {
//   const channel = new LoggerChannel();
//   const processorMock1 = vi.fn((_messages, next) => next([{ level: 111, args: ['bbb'], context: 222 }]));
//   const processorMock2 = vi.fn();
//
//   channel.to(processorMock1).to(processorMock2);
//
//   channel.dispatch(0, ['aaa']);
//
//   expect(processorMock1).toHaveBeenCalledTimes(1);
//   expect(processorMock1).toHaveBeenNthCalledWith(
//     1,
//     [{ level: 0, args: ['aaa'], context: undefined }],
//     expect.any(Function)
//   );
//   expect(processorMock2).toHaveBeenCalledTimes(1);
//   expect(processorMock2).toHaveBeenNthCalledWith(
//     1,
//     [{ level: 111, args: ['bbb'], context: 222 }],
//     expect.any(Function)
//   );
// });
