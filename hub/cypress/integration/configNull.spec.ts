/// <reference types="Cypress" />
/// <reference types="../support" />

describe('Check Null Configuration', () => {
  beforeEach(() => {
    cy.visit('/config')
    cy.getTestId("page-config")

    cy.get("*[data-testid=mixer-select] select").select('null')

    cy.getTestId("null")
  })
  afterEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=mixer-select] select").select('test')
    cy.getTestId("test-submit").click()
  })

  it('can save', () => {
    cy.getTestId("null-submit").click()

    cy.reload()
    cy.getTestId("null")
  })
})