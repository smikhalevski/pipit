import { Logger, LoggerChannel, LogLevel } from '../main';

describe('Logger', () => {
  test('creates a new logger', () => {
    const logger = new Logger();

    expect(logger.level).toBe(0);
    expect(logger.context).toBe(undefined);
    expect(logger.channels.length).toBe(0);
    expect(logger.traceEnabled).toBe(true);
    expect(logger.debugEnabled).toBe(true);
    expect(logger.infoEnabled).toBe(true);
    expect(logger.warnEnabled).toBe(true);
    expect(logger.errorEnabled).toBe(true);
    expect(logger.fatalEnabled).toBe(true);
  });

  test('creates a new logger with a log level', () => {
    const logger = new Logger(LogLevel.ERROR);

    expect(logger.level).toBe(LogLevel.ERROR);
    expect(logger.context).toBe(undefined);
    expect(logger.channels.length).toBe(0);
    expect(logger.traceEnabled).toBe(false);
    expect(logger.debugEnabled).toBe(false);
    expect(logger.infoEnabled).toBe(false);
    expect(logger.warnEnabled).toBe(false);
    expect(logger.errorEnabled).toBe(true);
    expect(logger.fatalEnabled).toBe(true);
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
    const dispatchSpy = jest.spyOn(logger, 'dispatch');

    logger.info('aaa', 'bbb');

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenNthCalledWith(1, LogLevel.INFO, ['aaa', 'bbb']);
  });

  test('info is bound to logger', () => {
    const logger = new Logger();
    const dispatchSpy = jest.spyOn(logger, 'dispatch');

    const info = logger.info;

    info('aaa', 'bbb');

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenNthCalledWith(1, LogLevel.INFO, ['aaa', 'bbb']);
  });

  test('dispatches message to all channels', () => {
    const processorMock1 = jest.fn();
    const processorMock2 = jest.fn();
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
    const processorMock = jest.fn();
    const logger = new Logger(LogLevel.ERROR);

    logger.openChannel().to(processorMock);

    logger.info('aaa');

    expect(processorMock).not.toHaveBeenCalled();

    logger.error('bbb');

    expect(processorMock).toHaveBeenCalledTimes(1);
  });

  test('attaches logger context', () => {
    const processorMock = jest.fn();
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
    const processorMock1 = jest.fn(() => {
      throw new Error('expected1');
    });
    const processorMock2 = jest.fn(() => {
      throw new Error('expected2');
    });
    const logger = new Logger();

    logger.openChannel().to(processorMock1);
    logger.openChannel().to(processorMock2);

    expect(() => logger.info('aaa')).toThrow(new Error('expected1'));

    expect(processorMock1).toHaveBeenCalledTimes(1);
    expect(processorMock2).toHaveBeenCalledTimes(1);
  });
});
