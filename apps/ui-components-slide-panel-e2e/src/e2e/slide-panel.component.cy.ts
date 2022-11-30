describe('ui-components-slide-panel', () => {
  beforeEach(() => cy.visit('/iframe.html?id=slidepanelcomponent--primary'));

  it('should render the component', () => {
    cy.get('mtb-slide-panel').should('exist');
  });
});
