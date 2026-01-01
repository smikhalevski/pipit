import { expect, test, vi } from 'vitest';
import { Level, Logger } from '../../main/index.js';
import sendToSentry from '../../main/processor/sendToSentry.js';

test('sends exceptions', () => {
  const nextMock = vi.fn();
  const captureMessageMock = vi.fn();
  const captureExceptionMock = vi.fn();
  const handler = sendToSentry({ captureException: captureExceptionMock, captureMessage: captureMessageMock })(
    new Logger()
  );

  handler([{ timestamp: 0, level: Level.ERROR, args: ['aaa'], context: undefined }], nextMock);

  expect(captureMessageMock).not.toHaveBeenCalled();
  expect(captureExceptionMock).toHaveBeenCalledTimes(1);
  expect(captureExceptionMock).toHaveBeenNthCalledWith(1, 'aaa');
});

test('sends messages', () => {
  const nextMock = vi.fn();
  const captureMessageMock = vi.fn();
  const captureExceptionMock = vi.fn();
  const handler = sendToSentry({ captureException: captureExceptionMock, captureMessage: captureMessageMock })(
    new Logger()
  );

  handler([{ timestamp: 0, level: Level.INFO, args: ['aaa'], context: undefined }], nextMock);

  expect(captureExceptionMock).not.toHaveBeenCalled();
  expect(captureMessageMock).toHaveBeenCalledTimes(1);
  expect(captureMessageMock).toHaveBeenNthCalledWith(1, 'aaa');
});
