import { expect, test, vi } from 'vitest';
import { Logger, LogMessage } from '../../main/index.js';
import prependTimestamp from '../../main/processor/prependTimestamp.js';

test('prepends timestamp to each message', () => {
  const nextMock = vi.fn();
  const messages: LogMessage[] = [
    { timestamp: 0, level: 111, args: ['aaa'], context: undefined },
    { timestamp: 1, level: 222, args: ['bbb'], context: undefined },
  ];

  prependTimestamp()(new Logger())(messages, nextMock);

  expect(messages[0].args).toEqual(['1970-01-01 00:00:00.000', 'aaa']);
  expect(messages[1].args).toEqual(['1970-01-01 00:00:00.001', 'bbb']);
  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, messages);
});

test('prepends colorized timestamp', () => {
  const nextMock = vi.fn();
  const messages: LogMessage[] = [
    { timestamp: 0, level: 111, args: ['aaa'], context: undefined },
    { timestamp: 1, level: 222, args: ['bbb'], context: undefined },
  ];

  prependTimestamp({ isColorized: true })(new Logger())(messages, nextMock);

  expect(messages[0].args).toEqual(['[2m1970-01-01[22m 00:00:00[2m.000[22m', 'aaa']);
  expect(messages[1].args).toEqual(['[2m1970-01-01[22m 00:00:00[2m.001[22m', 'bbb']);
  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, messages);
});

test('omits date', () => {
  const nextMock = vi.fn();
  const messages: LogMessage[] = [
    { timestamp: 0, level: 111, args: ['aaa'], context: undefined },
    { timestamp: 1, level: 222, args: ['bbb'], context: undefined },
  ];

  prependTimestamp({ noDate: true })(new Logger())(messages, nextMock);

  expect(messages[0].args).toEqual(['00:00:00.000', 'aaa']);
  expect(messages[1].args).toEqual(['00:00:00.001', 'bbb']);
  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, messages);
});

test('omits milliseconds', () => {
  const nextMock = vi.fn();
  const messages: LogMessage[] = [
    { timestamp: 0, level: 111, args: ['aaa'], context: undefined },
    { timestamp: 1, level: 222, args: ['bbb'], context: undefined },
  ];

  prependTimestamp({ noMilliseconds: true })(new Logger())(messages, nextMock);

  expect(messages[0].args).toEqual(['1970-01-01 00:00:00', 'aaa']);
  expect(messages[1].args).toEqual(['1970-01-01 00:00:00', 'bbb']);
  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, messages);
});

test('omits date and milliseconds', () => {
  const nextMock = vi.fn();
  const messages: LogMessage[] = [
    { timestamp: 0, level: 111, args: ['aaa'], context: undefined },
    { timestamp: 1, level: 222, args: ['bbb'], context: undefined },
  ];

  prependTimestamp({ noDate: true, noMilliseconds: true })(new Logger())(messages, nextMock);

  expect(messages[0].args).toEqual(['00:00:00', 'aaa']);
  expect(messages[1].args).toEqual(['00:00:00', 'bbb']);
  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, messages);
});
