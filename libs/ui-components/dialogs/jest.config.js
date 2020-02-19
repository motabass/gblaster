module.exports = {
  name: 'ui-components-dialogs',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/ui-components/dialogs',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
