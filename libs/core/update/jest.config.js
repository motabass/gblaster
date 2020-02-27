module.exports = {
  name: 'core-update',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/core/update',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
