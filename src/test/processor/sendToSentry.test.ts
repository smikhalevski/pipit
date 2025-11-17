import { expect, test, vi } from 'vitest';
import { LogLevel } from '../../main/index.js';
import sendToSentry from '../../main/processor/sendToSentry.js';

test('sends exceptions', () => {
  const nextMock = vi.fn();
  const captureMessageMock = vi.fn();
  const captureExceptionMock = vi.fn();
  const processor = sendToSentry({ captureException: captureExceptionMock, captureMessage: captureMessageMock });

  processor([{ level: LogLevel.ERROR, args: ['aaa'], context: undefined }], nextMock);

  expect(captureMessageMock).not.toHaveBeenCalled();
  expect(captureExceptionMock).toHaveBeenCalledTimes(1);
  expect(captureExceptionMock).toHaveBeenNthCalledWith(1, 'aaa');
});

test('sends messages', () => {
  const nextMock = vi.fn();
  const captureMessageMock = vi.fn();
  const captureExceptionMock = vi.fn();
  const processor = sendToSentry({ captureException: captureExceptionMock, captureMessage: captureMessageMock });

  processor([{ level: LogLevel.INFO, args: ['aaa'], context: undefined }], nextMock);

  expect(captureExceptionMock).not.toHaveBeenCalled();
  expect(captureMessageMock).toHaveBeenCalledTimes(1);
  expect(captureMessageMock).toHaveBeenNthCalledWith(1, 'aaa');
});
