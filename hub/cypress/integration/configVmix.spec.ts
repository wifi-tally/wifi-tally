/// <reference types="Cypress" />
/// <reference types="../support" />

describe('Check vMix Configuration', () => {
  beforeEach(() => {
    cy.visit('/config')
    cy.getTestId("page-config")

    cy.get("*[data-testid=mixer-select] select").select('vmix')

    cy.getTestId("vmix")
  })
  afterEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=mixer-select] select").select('test')
    cy.getTestId("test-submit").click()
  })

  it('respects validation rules', () => {
    cy.getTestId("vmix-submit").should('be.enabled')

    // ip
    cy.getTestId("vmix-ip").type("{selectall}foobar")
    cy.getTestId("vmix-submit").should('be.disabled')
    cy.getTestId("vmix-ip").type("{selectall}123.456.78.9")
    cy.getTestId("vmix-submit").should('be.disabled')
    cy.getTestId("vmix-ip").type("{selectall}1.2.3.4")
    cy.getTestId("vmix-submit").should('be.enabled')

    // port
    cy.getTestId("vmix-port").type("{selectall}-1000")
    cy.getTestId("vmix-submit").should('be.disabled')
    cy.getTestId("vmix-port").type("{selectall}invalid")
    cy.getTestId("vmix-submit").should('be.disabled')
    cy.getTestId("vmix-port").type("{selectall}9999")
    cy.getTestId("vmix-submit").should('be.enabled')
    cy.getTestId("vmix-port").type("9")
    cy.getTestId("vmix-submit").should('be.disabled')
    cy.getTestId("vmix-port").type("{selectall}1234")
    cy.getTestId("vmix-submit").should('be.enabled')
  })

  it('can save', () => {
    cy.getTestId("vmix-ip").type("{selectall}127.0.0.1")
    cy.getTestId("vmix-port").type("{selectall}9876")
    cy.getTestId("vmix-submit").click()

    cy.reload()
    cy.get("*[data-testid=vmix-ip] input").should('have.value', "127.0.0.1")
    cy.get("*[data-testid=vmix-port] input").should("have.value", "9876")
  })
})