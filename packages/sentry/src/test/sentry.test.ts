import { LogLevel } from 'pipit';
import { sendToSentry } from '../main';

describe('sendToSentry', () => {
  test('sends exceptions', () => {
    const nextMock = jest.fn();
    const captureMessageMock = jest.fn();
    const captureExceptionMock = jest.fn();
    const processor = sendToSentry({ captureException: captureExceptionMock, captureMessage: captureMessageMock });

    processor([{ level: LogLevel.ERROR, args: ['aaa'], context: undefined }], nextMock);

    expect(captureMessageMock).not.toHaveBeenCalled();
    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    expect(captureExceptionMock).toHaveBeenNthCalledWith(1, 'aaa');
  });

  test('sends messages', () => {
    const nextMock = jest.fn();
    const captureMessageMock = jest.fn();
    const captureExceptionMock = jest.fn();
    const processor = sendToSentry({ captureException: captureExceptionMock, captureMessage: captureMessageMock });

    processor([{ level: LogLevel.INFO, args: ['aaa'], context: undefined }], nextMock);

    expect(captureExceptionMock).not.toHaveBeenCalled();
    expect(captureMessageMock).toHaveBeenCalledTimes(1);
    expect(captureMessageMock).toHaveBeenNthCalledWith(1, 'aaa');
  });
});
