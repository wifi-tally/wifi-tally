/// <reference types="cypress" />

describe('Check Null Configuration', () => {
  beforeEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=page-config]")

    cy.get("*[data-testid=mixer-select] select").select('null')

    cy.get("*[data-testid=null]")
  })
  afterEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=mixer-select] select").select('test')
    cy.get("*[data-testid=test-submit]").click()
  })

  it('can save', () => {
    cy.get("*[data-testid=null-submit]").click()

    cy.reload()
    cy.get("*[data-testid=null]")
  })
})