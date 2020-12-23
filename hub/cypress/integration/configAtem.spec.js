/// <reference types="cypress" />

describe('Check Atem Configuration', () => {
  beforeEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=page-config]")

    cy.get("*[data-testid=mixer-select] select").select('atem')

    cy.get("*[data-testid=atem]")
  })
  afterEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=mixer-select] select").select('test')
    cy.get("*[data-testid=test-submit]").click()
  })

  it('respects validation rules', () => {
    cy.get("*[data-testid=atem-submit]").should('be.enabled')

    // ip
    cy.get("*[data-testid=atem-ip]").type("{selectall}foobar")
    cy.get("*[data-testid=atem-submit]").should('be.disabled')
    cy.get("*[data-testid=atem-ip]").type("{selectall}123.456.78.9")
    cy.get("*[data-testid=atem-submit]").should('be.disabled')
    cy.get("*[data-testid=atem-ip]").type("{selectall}1.2.3.4")
    cy.get("*[data-testid=atem-submit]").should('be.enabled')

    // port
    cy.get("*[data-testid=atem-port]").type("{selectall}-1000")
    cy.get("*[data-testid=atem-submit]").should('be.disabled')
    cy.get("*[data-testid=atem-port]").type("{selectall}invalid")
    cy.get("*[data-testid=atem-submit]").should('be.disabled')
    cy.get("*[data-testid=atem-port]").type("{selectall}9999")
    cy.get("*[data-testid=atem-submit]").should('be.enabled')
    cy.get("*[data-testid=atem-port]").type("9")
    cy.get("*[data-testid=atem-submit]").should('be.disabled')
    cy.get("*[data-testid=atem-port]").type("{selectall}1234")
    cy.get("*[data-testid=atem-submit]").should('be.enabled')
  })

  it('can save', () => {
    cy.get("*[data-testid=atem-ip]").type("{selectall}127.0.0.1")
    cy.get("*[data-testid=atem-port]").type("{selectall}9876")
    cy.get("*[data-testid=atem-submit]").click()

    cy.reload()
    cy.get("*[data-testid=atem-ip] input").should('have.value', "127.0.0.1")
    cy.get("*[data-testid=atem-port] input").should("have.value", "9876")
  })
})