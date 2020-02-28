module.exports = {
  name: 'helper-services-gamepad',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/helper-services/gamepad',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
