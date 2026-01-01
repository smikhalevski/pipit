import { afterEach, expect, test, vi } from 'vitest';
import { Level, Logger, type LogMessage } from '../../main/index.js';
import writeToConsole from '../../main/processor/writeToConsole.js';

const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
const consoleTraceSpy = vi.spyOn(console, 'trace').mockImplementation(() => undefined);
const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

afterEach(() => {
  consoleErrorSpy.mockReset();
  consoleWarnSpy.mockReset();
  consoleTraceSpy.mockReset();
  consoleDebugSpy.mockReset();
  consoleInfoSpy.mockReset();
  consoleLogSpy.mockReset();
});

test('calls console methods', () => {
  const nextMock = vi.fn();

  const messages: LogMessage[] = [
    { timestamp: 0, level: Level.TRACE, args: ['aaa_trace'], context: undefined },
    { timestamp: 0, level: Level.DEBUG, args: ['aaa_debug'], context: undefined },
    { timestamp: 0, level: Level.INFO, args: ['aaa_info'], context: undefined },
    { timestamp: 0, level: Level.WARN, args: ['aaa_warn'], context: undefined },
    { timestamp: 0, level: Level.ERROR, args: ['aaa_error'], context: undefined },
    { timestamp: 0, level: Level.FATAL, args: ['aaa_fatal'], context: undefined },
  ];

  writeToConsole()(new Logger())(messages, nextMock);

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, messages);
  expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, 'aaa_error');
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, 'aaa_fatal');
  expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  expect(consoleWarnSpy).toHaveBeenNthCalledWith(1, 'aaa_warn');
  expect(consoleTraceSpy).toHaveBeenCalledTimes(1);
  expect(consoleTraceSpy).toHaveBeenNthCalledWith(1, 'aaa_trace');
  expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
  expect(consoleDebugSpy).toHaveBeenNthCalledWith(1, 'aaa_debug');
  expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
  expect(consoleInfoSpy).toHaveBeenNthCalledWith(1, 'aaa_info');

  expect(consoleLogSpy).not.toHaveBeenCalled();
});
