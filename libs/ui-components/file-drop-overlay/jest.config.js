module.exports = {
  name: 'ui-components-file-drop-overlay',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/ui-components/file-drop-overlay',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
