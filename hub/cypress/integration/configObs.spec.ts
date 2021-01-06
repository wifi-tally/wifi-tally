/// <reference types="Cypress" />
/// <reference types="../support" />

describe('Check OBS Configuration', () => {
  beforeEach(() => {
    cy.visit('/config')
    cy.getTestId("page-config")

    cy.get("*[data-testid=mixer-select] select").select('obs')

    cy.getTestId("obs")
  })
  afterEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=mixer-select] select").select('test')
    cy.getTestId("test-submit").click()
  })

  it('respects validation rules', () => {
    cy.getTestId("obs-submit").should('be.enabled')

    // ip
    cy.getTestId("obs-ip").type("{selectall}foobar")
    cy.getTestId("obs-submit").should('be.disabled')
    cy.getTestId("obs-ip").type("{selectall}123.456.78.9")
    cy.getTestId("obs-submit").should('be.disabled')
    cy.getTestId("obs-ip").type("{selectall}1.2.3.4")
    cy.getTestId("obs-submit").should('be.enabled')

    // port
    cy.getTestId("obs-port").type("{selectall}-1000")
    cy.getTestId("obs-submit").should('be.disabled')
    cy.getTestId("obs-port").type("{selectall}invalid")
    cy.getTestId("obs-submit").should('be.disabled')
    cy.getTestId("obs-port").type("{selectall}9999")
    cy.getTestId("obs-submit").should('be.enabled')
    cy.getTestId("obs-port").type("9")
    cy.getTestId("obs-submit").should('be.disabled')
    cy.getTestId("obs-port").type("{selectall}1234")
    cy.getTestId("obs-submit").should('be.enabled')
  })

  it('can save', () => {
    cy.getTestId("obs-ip").type("{selectall}127.0.0.1")
    cy.getTestId("obs-port").type("{selectall}9876")
    cy.getTestId("obs-submit").click()

    cy.reload()
    cy.get("*[data-testid=obs-ip] input").should('have.value', "127.0.0.1")
    cy.get("*[data-testid=obs-port] input").should("have.value", "9876")
  })
})