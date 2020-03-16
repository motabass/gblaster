import 'cypress-file-upload';
import { getLoadFilesButton } from './player.po';

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable<Subject> {
    loadFiles(): void;
  }
}
//
// -- This is a parent command --
Cypress.Commands.add('loadFiles', () => {
  console.log('Loading files...');
  // load files
  getLoadFilesButton().click();

  const fixtures: Blob[] = [];

  Cypress.Promise.all([
    cy
      .fixture('440Hz-5sec.mp3', 'base64')
      .then(Cypress.Blob.base64StringToBlob)
      .then((fx) => {
        fixtures.push(fx);
      }),
    cy
      .fixture('tek.mp3', 'base64')
      .then(Cypress.Blob.base64StringToBlob)
      .then((fx) => {
        fixtures.push(fx);
      })
  ]).then((fx) => {
    const [first, second] = fixtures;

    const files: any[] = [
      { fileContent: first, fileName: '440Hz-5sec.mp3', mimeType: 'audio/mp3', encoding: 'utf8' },
      { fileContent: second, fileName: 'tek.mp3', mimeType: 'audio/mp3', encoding: 'utf8' }
    ];

    return cy.get('#hidden_file_input').upload(files, { subjectType: 'input', force: true });
  });
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
