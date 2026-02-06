import { expect, test, vi } from 'vitest';
import { Level, Logger } from '../../main/index.js';
import structurizeArgs from '../../main/processor/structurizeArgs.js';

test('stringifies message without args', () => {
  const nextMock = vi.fn();

  structurizeArgs()(new Logger())([{ timestamp: 0, level: Level.ERROR, args: [], context: undefined }], nextMock);

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: [{ timestamp: new Date(0), level: 'error' }],
      context: undefined,
    },
  ]);
});

test('stringifies message with a string arg', () => {
  const nextMock = vi.fn();

  structurizeArgs()(new Logger())([{ timestamp: 0, level: Level.ERROR, args: ['aaa'], context: undefined }], nextMock);

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: [{ timestamp: new Date(0), level: 'error', message: 'aaa' }],
      context: undefined,
    },
  ]);
});

test('stringifies message with multiple string args', () => {
  const nextMock = vi.fn();

  structurizeArgs()(new Logger())(
    [{ timestamp: 0, level: Level.ERROR, args: ['aaa', 'bbb'], context: undefined }],
    nextMock
  );

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: [{ timestamp: new Date(0), level: 'error', message: 'aaa' }],
      context: undefined,
    },
  ]);
});

test('stringifies message with an Error arg', () => {
  const nextMock = vi.fn();

  structurizeArgs()(new Logger())(
    [{ timestamp: 0, level: Level.ERROR, args: [new Error('aaa')], context: undefined }],
    nextMock
  );

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: [
        {
          timestamp: new Date(0),
          level: 'error',
          message: 'aaa',
          stackTrace: expect.stringContaining('Error: aaa'),
        },
      ],
      context: undefined,
    },
  ]);
});

test('injects additional payload content', () => {
  const nextMock = vi.fn();
  const getAdditionalPayloadMock = vi.fn().mockReturnValue({ xxx: 'yyy' });

  structurizeArgs({ getAdditionalPayload: getAdditionalPayloadMock })(new Logger())(
    [{ timestamp: 0, level: Level.ERROR, args: ['aaa'], context: undefined }],
    nextMock
  );

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: [{ timestamp: new Date(0), level: 'error', message: 'aaa', xxx: 'yyy' }],
      context: undefined,
    },
  ]);
});

test('injects context into the payload', () => {
  const nextMock = vi.fn();

  structurizeArgs()(new Logger())(
    [{ timestamp: 0, level: Level.ERROR, args: ['aaa'], context: { xxx: 'yyy' } }],
    nextMock
  );

  expect(nextMock).toHaveBeenCalledTimes(1);
  expect(nextMock).toHaveBeenNthCalledWith(1, [
    {
      timestamp: 0,
      level: 500,
      args: [{ timestamp: new Date(0), level: 'error', message: 'aaa', xxx: 'yyy' }],
      context: { xxx: 'yyy' },
    },
  ]);
});
