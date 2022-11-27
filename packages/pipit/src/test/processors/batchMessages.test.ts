import { batchMessages } from '../../main';

describe('batchMessages', () => {
  test('batches messages using limit strategy', () => {
    const nextMock = jest.fn();
    const processor = batchMessages({ timeout: -1, limit: 2 });

    processor([{ level: 0, args: ['aaa'], context: undefined }], nextMock);

    expect(nextMock).not.toHaveBeenCalled();

    processor([{ level: 0, args: ['bbb'], context: undefined }], nextMock);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenNthCalledWith(1, [
      { level: 0, args: ['aaa'], context: undefined },
      { level: 0, args: ['bbb'], context: undefined },
    ]);
  });

  test('batches messages using timeout strategy', done => {
    const nextMock = jest.fn();
    const processor = batchMessages({ timeout: 10, limit: -1 });

    processor([{ level: 0, args: ['aaa'], context: undefined }], nextMock);

    expect(nextMock).not.toHaveBeenCalled();

    processor([{ level: 0, args: ['bbb'], context: undefined }], nextMock);

    expect(nextMock).not.toHaveBeenCalled();

    nextMock.mockImplementation(() => done());
  });
});
