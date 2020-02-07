module.exports = {
  name: 'ui-components-player',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/ui-components/player',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
