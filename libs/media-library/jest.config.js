module.exports = {
  name: 'media-library',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/media-library',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
