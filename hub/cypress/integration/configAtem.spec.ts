/// <reference types="Cypress" />
/// <reference types="../support" />

describe('Check Atem Configuration', () => {
  beforeEach(() => {
    cy.visit('/config')
    cy.getTestId("page-config")

    cy.get("*[data-testid=mixer-select] select").select('atem')

    cy.getTestId("atem")
  })
  afterEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=mixer-select] select").select('test')
    cy.getTestId("test-submit").click()
  })

  it('respects validation rules', () => {
    cy.getTestId("atem-submit").should('be.enabled')

    // ip
    cy.getTestId("atem-ip").type("{selectall}foobar")
    cy.getTestId("atem-submit").should('be.disabled')
    cy.getTestId("atem-ip").type("{selectall}123.456.78.9")
    cy.getTestId("atem-submit").should('be.disabled')
    cy.getTestId("atem-ip").type("{selectall}1.2.3.4")
    cy.getTestId("atem-submit").should('be.enabled')

    // port
    cy.getTestId("atem-port").type("{selectall}-1000")
    cy.getTestId("atem-submit").should('be.disabled')
    cy.getTestId("atem-port").type("{selectall}invalid")
    cy.getTestId("atem-submit").should('be.disabled')
    cy.getTestId("atem-port").type("{selectall}9999")
    cy.getTestId("atem-submit").should('be.enabled')
    cy.getTestId("atem-port").type("9")
    cy.getTestId("atem-submit").should('be.disabled')
    cy.getTestId("atem-port").type("{selectall}1234")
    cy.getTestId("atem-submit").should('be.enabled')
    
  })

  it('can save', () => {
    cy.getTestId("atem-ip").type("{selectall}127.0.0.1")
    cy.getTestId("atem-port").type("{selectall}9876")
    cy.getTestId("atem-submit").click()

    cy.reload()
    cy.get("*[data-testid=atem-ip] input").should('have.value', "127.0.0.1")
    cy.get("*[data-testid=atem-port] input").should("have.value", "9876")
  })
})