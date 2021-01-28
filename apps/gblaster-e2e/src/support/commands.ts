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
  getLoadFilesButton().click();
  cy.get('#hidden_file_input').attachFile([
    { filePath: 'tek.mp3', encoding: 'base64' },
    { filePath: '440Hz-5sec.mp3', encoding: 'base64' }
  ]);
  // });
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
