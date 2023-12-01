describe('Share', () => {
  it('Open password protected sharing', () => {
    cy.viewport(1200, 600);
    cy.visit('/');
    cy.get('.card-body');
    cy.get('.col-sm-12').contains('Login');
    /* ==== Generated with Cypress Studio ==== */
    cy.get('#username').type('admin');
    cy.get('#password').clear();
    cy.get('#password').type('admin');
    cy.intercept({
      method: 'Get',
      url: '/pgapi/gallery/content/*',
    }).as('getContent');
    cy.get('.col-sm-12 > .btn').click();

    cy.wait('@getContent');

    cy.get('button#shareButton').click();
    cy.get('input#share-password').type('secret', {force: true});
    cy.get('button#getShareButton').click();

    cy.get('input#shareLink').should('contain.value', 'http');
    cy.get('input#shareLink')
      .invoke('val')
      .then((link: string) => {
        cy.get('button.btn-close').click();
        cy.get('button#button-frame-menu').click();
        cy.get('#dropdown-frame-menu  ng-icon[name="ionLogOutOutline"]').click({scrollBehavior: false});
        cy.visit(link);
        cy.get('input#password').type('secret');
        cy.get('button#button-share-login').click();


        cy.get('.mb-0 > :nth-child(1) > .nav-link').contains('Gallery');

        cy.wait('@getContent').then((interception) => {
          assert.isNotNull(interception.response.body, '1st API call has data');
        });
      });

  });

  it('Open password protected sharing with logged in user', () => {
    cy.viewport(1200, 600);
    cy.visit('/');
    cy.get('.card-body');
    cy.get('.col-sm-12').contains('Login');
    /* ==== Generated with Cypress Studio ==== */
    cy.get('#username').type('admin');
    cy.get('#password').clear();
    cy.get('#password').type('admin');
    cy.intercept({
      method: 'Get',
      url: '/pgapi/gallery/content/*',
    }).as('getContent');
    cy.get('.col-sm-12 > .btn').click();

    cy.wait('@getContent');

    cy.get('button#shareButton').click();
    cy.get('input#share-password').type('secret', {force: true});
    cy.get('button#getShareButton').click();

    cy.get('input#shareLink').should('contain.value', 'http');
    cy.get('input#shareLink')
      .invoke('val')
      .then((link: string) => {
         cy.visit(link);


        cy.get('.mb-0 > :nth-child(1) > .nav-link').contains('Gallery');

        cy.wait('@getContent').then((interception) => {
          assert.isNotNull(interception.response.body, '1st API call has data');
        });
      });

  });


  it('Open no password sharing', () => {
    cy.viewport(1200, 600);
    cy.visit('/');
    cy.get('.card-body');
    cy.get('.col-sm-12').contains('Login');
    /* ==== Generated with Cypress Studio ==== */
    cy.get('#username').type('admin');
    cy.get('#password').clear();
    cy.get('#password').type('admin');
    cy.intercept({
      method: 'Get',
      url: '/pgapi/gallery/content/*',
    }).as('getContent');
    cy.get('.col-sm-12 > .btn').click();

    cy.wait('@getContent');

    cy.get('button#shareButton').click();
    cy.get('button#getShareButton').click();

    cy.get('input#shareLink').should('contain.value', 'http');
    cy.get('input#shareLink')
      .invoke('val')
      .then((link: string) => {
        cy.get('button.btn-close').click();
        cy.get('button#button-frame-menu').click();
        cy.get('#dropdown-frame-menu  ng-icon[name="ionLogOutOutline"]').click({scrollBehavior: false});
        cy.visit(link);


        cy.get('.mb-0 > :nth-child(1) > .nav-link').contains('Gallery');

        cy.wait('@getContent').then((interception) => {
          assert.isNotNull(interception.response.body, '1st API call has data');
        });
      });
  });
});
