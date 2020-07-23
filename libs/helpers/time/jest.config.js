module.exports = {
  name: 'helpers-time',
  preset: '../../../jest.config.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../../coverage/libs/helpers/time',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } }
};
