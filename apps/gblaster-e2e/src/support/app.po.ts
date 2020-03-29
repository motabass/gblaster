export const getToolBarTitle = () => cy.get('.title');
export const getSidenavToggleButton = () => cy.get('#sidenav_menu_button');
export const getSidenavLink = (link: number) => cy.get(`:nth-child(${link}) > .mat-list-item-content`);
