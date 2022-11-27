import { LogLevel, LogMessage, printToConsole } from '../../main';

describe('printToConsole', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const traceSpy = jest.spyOn(console, 'trace').mockImplementation(() => undefined);
  const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

  afterEach(() => {
    errorSpy.mockReset();
    warnSpy.mockReset();
    traceSpy.mockReset();
    debugSpy.mockReset();
    logSpy.mockReset();
  });

  test('calls console methods', () => {
    const nextMock = jest.fn();
    const messages: LogMessage[] = [
      { level: LogLevel.TRACE, args: ['aaa_trace'], context: undefined },
      { level: LogLevel.DEBUG, args: ['aaa_debug'], context: undefined },
      { level: LogLevel.INFO, args: ['aaa_info'], context: undefined },
      { level: LogLevel.WARN, args: ['aaa_warn'], context: undefined },
      { level: LogLevel.ERROR, args: ['aaa_error'], context: undefined },
      { level: LogLevel.FATAL, args: ['aaa_fatal'], context: undefined },
    ];

    printToConsole()(messages, nextMock);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenNthCalledWith(1, messages);
    expect(errorSpy).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenNthCalledWith(1, 'aaa_error');
    expect(errorSpy).toHaveBeenNthCalledWith(2, 'aaa_fatal');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenNthCalledWith(1, 'aaa_warn');
    expect(traceSpy).toHaveBeenCalledTimes(1);
    expect(traceSpy).toHaveBeenNthCalledWith(1, 'aaa_trace');
    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenNthCalledWith(1, 'aaa_debug');
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenNthCalledWith(1, 'aaa_info');
  });
});
