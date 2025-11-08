import { getCoverDisplay, getPlaylistItems, getVolumeButton, getVolumeSlider } from '../support/player.po';

describe('gblaster', () => {
  beforeEach(() => {
    // Ignore uncaught exceptions from color extraction failures in tests
    cy.on('uncaught:exception', (err) => {
      // Ignore Canvas color extraction errors
      if (err.message.includes('addColorStop') || err.message.includes('CanvasGradient')) {
        return false;
      }
      // Let other errors fail the test
      return true;
    });

    cy.visit('/player');
    // turn down volume
    getVolumeButton().click();
    getVolumeSlider().click('bottom');

    cy.loadFiles().wait(2500);
  });

  it('should load a file with legacy file loader', () => {
    // initial playlist after load
    getPlaylistItems().should('have.length', 2);
    getPlaylistItems().first();
    getPlaylistItems()
      .first()
      .should('be.visible')
      .should('contain', 'Get U Freak On (_insane_teknology_rmx)')
      .should('contain', 'Teknambul');
    // .should('have.css', 'border-left')
    // .and('match', /4px solid/);

    getPlaylistItems().eq(1).should('be.visible').should('contain', '440Hz Sine Wave');

    // click second item
    getPlaylistItems().eq(1).click();
    getPlaylistItems()
      .eq(1)
      .should('have.css', 'border-left')
      .and('match', /4px solid/);
  });

  it('should play the file', () => {
    // play second song
    getPlaylistItems().eq(0).dblclick();

    getCoverDisplay().should('contain', 'Get U Freak On (_insane_teknology_rmx)');
    getCoverDisplay().should('contain', 'Teknambul');
  });
});
