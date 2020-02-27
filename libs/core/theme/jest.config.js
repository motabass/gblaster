module.exports = {
  name: 'core-theme',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/core/theme',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
