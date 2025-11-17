import { expect, test, vi } from 'vitest';
import { LoggerChannel } from '../main/index.js';

test('creates a new channel', () => {
  const channel = new LoggerChannel();

  expect(channel.processors.length).toBe(0);
});

test('appends a processor', () => {
  const channel = new LoggerChannel();
  const processor = () => undefined;

  expect(channel.to(processor)).toBe(channel);
  expect(channel.processors.length).toBe(1);
  expect(channel.processors[0]).toBe(processor);
});

test('does not fail if there are no processors', () => {
  const channel = new LoggerChannel();

  channel.dispatch(0, ['aaa']);
});

test('does not fail if the last processor invokes next', () => {
  const channel = new LoggerChannel();

  channel.to((messages, next) => {
    next(messages);
  });

  channel.dispatch(0, ['aaa']);
});

test('invokes a processor', () => {
  const channel = new LoggerChannel();
  const processorMock = vi.fn();

  channel.to(processorMock);

  channel.dispatch(0, ['aaa']);

  expect(processorMock).toHaveBeenCalledTimes(1);
  expect(processorMock).toHaveBeenNthCalledWith(
    1,
    [{ level: 0, args: ['aaa'], context: undefined }],
    expect.any(Function)
  );
});

test('invokes another channel', () => {
  const channel1 = new LoggerChannel();
  const channel2 = new LoggerChannel();
  const processorMock = vi.fn();

  const dispatchSpy = vi.spyOn(channel2, 'dispatch');

  channel1.to(channel2).to(processorMock);

  channel1.dispatch(0, ['aaa'], 111);

  expect(dispatchSpy).toHaveBeenCalledTimes(1);
  expect(dispatchSpy).toHaveBeenNthCalledWith(1, 0, ['aaa'], 111);
  expect(processorMock).toHaveBeenCalledTimes(1);
  expect(processorMock).toHaveBeenNthCalledWith(1, [{ level: 0, args: ['aaa'], context: 111 }], expect.any(Function));
});

test('a processor can invoke the next processor', () => {
  const channel = new LoggerChannel();
  const processorMock1 = vi.fn((_messages, next) => next([{ level: 111, args: ['bbb'], context: 222 }]));
  const processorMock2 = vi.fn();

  channel.to(processorMock1).to(processorMock2);

  channel.dispatch(0, ['aaa']);

  expect(processorMock1).toHaveBeenCalledTimes(1);
  expect(processorMock1).toHaveBeenNthCalledWith(
    1,
    [{ level: 0, args: ['aaa'], context: undefined }],
    expect.any(Function)
  );
  expect(processorMock2).toHaveBeenCalledTimes(1);
  expect(processorMock2).toHaveBeenNthCalledWith(
    1,
    [{ level: 111, args: ['bbb'], context: 222 }],
    expect.any(Function)
  );
});
