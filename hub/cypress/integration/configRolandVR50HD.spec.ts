/// <reference types="Cypress" />
/// <reference types="../support" />

describe('Check Roland VR-50HD Configuration', () => {
  beforeEach(() => {
    cy.visit('/config')
    cy.getTestId("page-config")

    cy.get("*[data-testid=mixer-select] select").select('rolandVR50HD')

    cy.getTestId("rolandVR50HD")
  })
  afterEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=mixer-select] select").select('test')
    cy.getTestId("test-submit").click()
  })

  it('respects validation rules', () => {
    cy.getTestId("rolandVR50HD-submit").should('be.enabled')

    // ip
    cy.getTestId("rolandVR50HD-ip").type("{selectall}foobar")
    cy.getTestId("rolandVR50HD-submit").should('be.disabled')
    cy.getTestId("rolandVR50HD-ip").type("{selectall}123.456.78.9")
    cy.getTestId("rolandVR50HD-submit").should('be.disabled')
    cy.getTestId("rolandVR50HD-ip").type("{selectall}1.2.3.4")
    cy.getTestId("rolandVR50HD-submit").should('be.enabled')

    // port
    cy.getTestId("rolandVR50HD-port").type("{selectall}-1000")
    cy.getTestId("rolandVR50HD-submit").should('be.disabled')
    cy.getTestId("rolandVR50HD-port").type("{selectall}invalid")
    cy.getTestId("rolandVR50HD-submit").should('be.disabled')
    cy.getTestId("rolandVR50HD-port").type("{selectall}9999")
    cy.getTestId("rolandVR50HD-submit").should('be.enabled')
    cy.getTestId("rolandVR50HD-port").type("9")
    cy.getTestId("rolandVR50HD-submit").should('be.disabled')
    cy.getTestId("rolandVR50HD-port").type("{selectall}1234")
    cy.getTestId("rolandVR50HD-submit").should('be.enabled')
  })

  it('can save', () => {
    cy.getTestId("rolandVR50HD-ip").type("{selectall}127.0.0.1")
    cy.getTestId("rolandVR50HD-port").type("{selectall}9876")
    cy.getTestId("rolandVR50HD-submit").click()

    cy.reload()
    cy.get("*[data-testid=rolandVR50HD-ip] input").should('have.value', "127.0.0.1")
    cy.get("*[data-testid=rolandVR50HD-port] input").should("have.value", "9876")
  })
})