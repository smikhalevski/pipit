const path = require('path');

module.exports = {
  rootDir: process.cwd(),
  preset: 'ts-jest',
  modulePathIgnorePatterns: ['/lib/'],
  moduleNameMapper: {
    '^pipit$': path.resolve(__dirname, './packages/pipit/src/main'),
    '^@pipit/(.*)$': path.resolve(__dirname, './packages/$1/src/main'),
  },
};
