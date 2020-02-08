module.exports = {
  name: 'ui-components-slide-panel',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/ui-components/slide-panel',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
