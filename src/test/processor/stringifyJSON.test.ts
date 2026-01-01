import { expect, test, vi } from 'vitest';
import { Level, Logger } from '../../main/index.js';
import stringifyJSON from '../../main/processor/stringifyJSON.js';

test('stringifies message without args', () => {
  const nextMock = vi.fn();

  stringifyJSON()(new Logger())([{ timestamp: 0, level: Level.ERROR, args: [], context: undefined }], nextMock);

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: ['{"timestamp":"1970-01-01T00:00:00.000Z","level":"error"}'],
      context: undefined,
    },
  ]);
});

test('stringifies message with a string arg', () => {
  const nextMock = vi.fn();

  stringifyJSON()(new Logger())([{ timestamp: 0, level: Level.ERROR, args: ['aaa'], context: undefined }], nextMock);

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: ['{"timestamp":"1970-01-01T00:00:00.000Z","level":"error","message":"aaa"}'],
      context: undefined,
    },
  ]);
});

test('stringifies message with multiple a string args', () => {
  const nextMock = vi.fn();

  stringifyJSON()(new Logger())(
    [{ timestamp: 0, level: Level.ERROR, args: ['aaa', 'bbb'], context: undefined }],
    nextMock
  );

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: ['{"timestamp":"1970-01-01T00:00:00.000Z","level":"error","message":"aaabbb"}'],
      context: undefined,
    },
  ]);
});

test('stringifies message with a number arg', () => {
  const nextMock = vi.fn();

  stringifyJSON()(new Logger())([{ timestamp: 0, level: Level.ERROR, args: [111], context: undefined }], nextMock);

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: ['{"timestamp":"1970-01-01T00:00:00.000Z","level":"error","message":111}'],
      context: undefined,
    },
  ]);
});

test('stringifies message with multiple number args', () => {
  const nextMock = vi.fn();

  stringifyJSON()(new Logger())([{ timestamp: 0, level: Level.ERROR, args: [111, 222], context: undefined }], nextMock);

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: ['{"timestamp":"1970-01-01T00:00:00.000Z","level":"error","message":"111222"}'],
      context: undefined,
    },
  ]);
});

test('stringifies message with an object arg', () => {
  const nextMock = vi.fn();

  stringifyJSON()(new Logger())(
    [{ timestamp: 0, level: Level.ERROR, args: [{ aaa: 111 }], context: undefined }],
    nextMock
  );

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: ['{"timestamp":"1970-01-01T00:00:00.000Z","level":"error","aaa":111}'],
      context: undefined,
    },
  ]);
});

test('stringifies message with a multiple object args', () => {
  const nextMock = vi.fn();

  stringifyJSON()(new Logger())(
    [{ timestamp: 0, level: Level.ERROR, args: [{ aaa: 111 }, { bbb: 222 }], context: undefined }],
    nextMock
  );

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: ['{"timestamp":"1970-01-01T00:00:00.000Z","level":"error","aaa":111,"bbb":222}'],
      context: undefined,
    },
  ]);
});

test('stringifies message with an object arg and object context', () => {
  const nextMock = vi.fn();

  stringifyJSON()(new Logger())(
    [{ timestamp: 0, level: Level.ERROR, args: [{ aaa: 111 }], context: { bbb: 222 } }],
    nextMock
  );

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: ['{"timestamp":"1970-01-01T00:00:00.000Z","level":"error","aaa":111,"bbb":222}'],
      context: { bbb: 222 },
    },
  ]);
});

test('message object arg properties have precedence over an object context properties', () => {
  const nextMock = vi.fn();

  stringifyJSON()(new Logger())(
    [{ timestamp: 0, level: Level.ERROR, args: [{ aaa: 111 }, { bbb: 222 }], context: { bbb: 333 } }],
    nextMock
  );

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: ['{"timestamp":"1970-01-01T00:00:00.000Z","level":"error","aaa":111,"bbb":222}'],
      context: { bbb: 333 },
    },
  ]);
});

test('stringifies message with a sting a and an object arg', () => {
  const nextMock = vi.fn();

  stringifyJSON()(new Logger())(
    [{ timestamp: 0, level: Level.ERROR, args: [{ aaa: 111 }, 'xxx'], context: undefined }],
    nextMock
  );

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: ['{"timestamp":"1970-01-01T00:00:00.000Z","level":"error","message":"xxx","aaa":111}'],
      context: undefined,
    },
  ]);
});
