import { getSidenavLink, getSidenavToggleButton, getToolBarTitle } from '../support/app.po';
import { getCardTitle } from '../support/settings.po';

describe('gblaster', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show working shell', () => {
    getToolBarTitle().contains('gBlaster');

    getSidenavToggleButton().click();
    getSidenavLink(4).click();

    getCardTitle('Theme-Colors');
    getCardTitle('Local Storage Settings');

    getSidenavToggleButton().click();
    getSidenavLink(1).click();
  });
});
