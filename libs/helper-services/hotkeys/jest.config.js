module.exports = {
  name: 'helper-services-hotkeys',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/helper-services/hotkeys',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
