import { levelCutoff, LogMessage } from '../../main';

describe('levelCutoff', () => {
  test('passes message as is', () => {
    const nextMock = jest.fn();
    const messages: LogMessage[] = [
      { level: 111, args: ['aaa'], context: undefined },
      { level: 222, args: ['bbb'], context: undefined },
    ];

    levelCutoff(100)(messages, nextMock);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenNthCalledWith(1, messages);
  });

  test('filter out messages with insufficient level', () => {
    const nextMock = jest.fn();
    const messages: LogMessage[] = [
      { level: 111, args: ['aaa'], context: undefined },
      { level: 222, args: ['bbb'], context: undefined },
    ];

    levelCutoff(200)(messages, nextMock);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenNthCalledWith(1, [{ level: 222, args: ['bbb'], context: undefined }]);
  });
});
