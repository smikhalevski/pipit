module.exports = {
  rootDir: process.cwd(),
  preset: 'ts-jest',
  modulePathIgnorePatterns: ['/lib/'],
  moduleNameMapper: {
    '^pipit$': __dirname + '/packages/pipit/src/main',
    '^@pipit/(.*)$': __dirname + '/packages/$1/src/main',
  },
};
