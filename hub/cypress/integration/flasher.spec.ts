/// <reference types="Cypress" />
/// <reference types="../support" />

describe('Tally display', () => {
  beforeEach(() => {
    cy.visit('/flasher')
    cy.getTestId("page-flasher")
    // wait for error text before mocking
    cy.get("body").should('contain.text', 'Did not find any connected device')
  })
  afterEach(() => {
  })

  it.skip("TODO")
})