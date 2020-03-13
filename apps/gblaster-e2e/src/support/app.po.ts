export const getToolBarTitle = () => cy.get('.title');
export const getSidenavToggleButton = () => cy.get('#sidenav_menu_button');
export const getSidenavLink = (link: string) => cy.get(`[routerlink="/${link}"]`);
