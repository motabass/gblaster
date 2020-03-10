module.exports = {
  name: 'helper-services-loader',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/helper-services/loader',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
