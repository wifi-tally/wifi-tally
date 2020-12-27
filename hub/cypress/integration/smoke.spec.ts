/// <reference types="Cypress" />

describe('Smoke Test', () => {
  it('Check that the page is running', () => {
    cy.visit('/')
    cy.get("*[data-testid=page-index]")
  })

  it('Navigation is working', () => {
    cy.visit('/')
    cy.get("*[data-testid=page-index]")

    cy.contains("Configuration").click()
    cy.get("*[data-testid=page-config]")

    cy.contains("Tallies").click()
    cy.get("*[data-testid=page-index]")
  })

  it('allows deep links into /config', () => {
    cy.visit('/config')
    cy.get("*[data-testid=page-config]")
  })
})