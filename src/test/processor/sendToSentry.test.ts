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
  expect(captureExceptionMock).toHaveBeenNthCalledWith(1, new Error('aaa'), { level: 'error' });
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
  expect(captureMessageMock).toHaveBeenNthCalledWith(1, 'aaa', { level: 'info' });
});

test('injects additional capture options', () => {
  const nextMock = vi.fn();
  const captureMessageMock = vi.fn();
  const captureExceptionMock = vi.fn();
  const getAdditionalCaptureOptionsMock = vi.fn().mockReturnValue({ xxx: 'yyy' });

  const handler = sendToSentry(
    { captureException: captureExceptionMock, captureMessage: captureMessageMock },
    { getAdditionalCaptureOptions: getAdditionalCaptureOptionsMock }
  )(new Logger());

  const message = { timestamp: 0, level: Level.INFO, args: ['aaa'], context: { ppp: 'qqq' } };

  handler([message], nextMock);

  expect(getAdditionalCaptureOptionsMock).toHaveBeenCalledTimes(1);
  expect(getAdditionalCaptureOptionsMock).toHaveBeenNthCalledWith(1, message);

  expect(captureExceptionMock).not.toHaveBeenCalled();
  expect(captureMessageMock).toHaveBeenCalledTimes(1);
  expect(captureMessageMock).toHaveBeenNthCalledWith(1, 'aaa', {
    level: 'info',
    context: { ppp: 'qqq' },
    xxx: 'yyy',
  });
});

test('formats message text', () => {
  const nextMock = vi.fn();
  const captureMessageMock = vi.fn();
  const captureExceptionMock = vi.fn();
  const formatMessageMock = vi.fn().mockReturnValue('yyy');

  const handler = sendToSentry(
    { captureException: captureExceptionMock, captureMessage: captureMessageMock },
    { formatMessage: formatMessageMock }
  )(new Logger());

  const message = { timestamp: 0, level: Level.INFO, args: ['aaa'], context: undefined };

  handler([message], nextMock);

  expect(formatMessageMock).toHaveBeenCalledTimes(1);
  expect(formatMessageMock).toHaveBeenNthCalledWith(1, message);

  expect(captureExceptionMock).not.toHaveBeenCalled();
  expect(captureMessageMock).toHaveBeenCalledTimes(1);
  expect(captureMessageMock).toHaveBeenNthCalledWith(1, 'yyy', { level: 'info' });
});
