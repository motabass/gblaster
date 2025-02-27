import { getCoverDisplay, getPlaylistItems, getVolumeButton, getVolumeSlider } from '../support/player.po';

describe('gblaster', () => {
  beforeEach(() => {
    cy.visit('/player', {
      onBeforeLoad(win) {
        // @ts-expect-error
        delete win.showOpenFilePicker;
      }
    });
    // turn down volume
    getVolumeButton().click();
    getVolumeSlider().click('bottom');

    // @ts-expect-error
    cy.loadFiles().wait(2500);
  });

  it('should load a file with legacy file loader', () => {
    // initial playlist after load
    getPlaylistItems().should('have.length', 2);
    getPlaylistItems().first();
    getPlaylistItems().first().should('be.visible').should('contain', 'Get U Freak On (_insane_teknology_rmx)').should('contain', 'Teknambul');
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

    cy.get('audio')
      .first()
      .should((element) => {
        expect(element[0].duration).to.greaterThan(0);
        expect(element[0].paused).to.equal(false);
      });
  });
});
