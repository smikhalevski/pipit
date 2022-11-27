import { LogMessage, prepend } from '../../main';

describe('prepend', () => {
  test('prepends args to each message', () => {
    const nextMock = jest.fn();
    const messages: LogMessage[] = [
      { level: 111, args: ['aaa'], context: undefined },
      { level: 222, args: ['bbb'], context: undefined },
    ];

    prepend('ccc')(messages, nextMock);

    expect(messages[0].args).toEqual(['ccc', 'aaa']);
    expect(messages[1].args).toEqual(['ccc', 'bbb']);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenNthCalledWith(1, messages);
  });
});
