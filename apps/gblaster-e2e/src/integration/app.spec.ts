import { getSidenavLink, getSidenavToggleButton, getToolBarTitle } from '../support/app.po';
import { getCardTitle } from '../support/settings.po';

describe('gblaster', () => {
  beforeEach(() => cy.visit('/'));

  it('should show working shell', () => {
    getToolBarTitle().contains('gBlaster');

    getSidenavToggleButton().click();
    getSidenavLink('settings').click();

    getCardTitle('Theme-Colors');
    getCardTitle('Local Storage Settings');

    getSidenavToggleButton().click();
    getSidenavLink('player').click();
  });

  it('should load a file with legacy file loader', () => {
    const fileName = '440Hz-5sec.mp3';

    cy.fixture(fileName, 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get('#hidden_file_input').upload({ fileContent, fileName, mimeType: 'audio/mp3', encoding: 'utf8' }, { subjectType: 'input', force: true });
      });
  });
});
