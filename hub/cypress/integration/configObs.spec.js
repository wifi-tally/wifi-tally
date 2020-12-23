/// <reference types="cypress" />

describe('Check OBS Configuration', () => {
  beforeEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=page-config]")

    cy.get("*[data-testid=mixer-select] select").select('obs')

    cy.get("*[data-testid=obs]")
  })
  afterEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=mixer-select] select").select('test')
    cy.get("*[data-testid=test-submit]").click()
  })

  it('respects validation rules', () => {
    cy.get("*[data-testid=obs-submit]").should('be.enabled')

    // ip
    cy.get("*[data-testid=obs-ip]").type("{selectall}foobar")
    cy.get("*[data-testid=obs-submit]").should('be.disabled')
    cy.get("*[data-testid=obs-ip]").type("{selectall}123.456.78.9")
    cy.get("*[data-testid=obs-submit]").should('be.disabled')
    cy.get("*[data-testid=obs-ip]").type("{selectall}1.2.3.4")
    cy.get("*[data-testid=obs-submit]").should('be.enabled')

    // port
    cy.get("*[data-testid=obs-port]").type("{selectall}-1000")
    cy.get("*[data-testid=obs-submit]").should('be.disabled')
    cy.get("*[data-testid=obs-port]").type("{selectall}invalid")
    cy.get("*[data-testid=obs-submit]").should('be.disabled')
    cy.get("*[data-testid=obs-port]").type("{selectall}9999")
    cy.get("*[data-testid=obs-submit]").should('be.enabled')
    cy.get("*[data-testid=obs-port]").type("9")
    cy.get("*[data-testid=obs-submit]").should('be.disabled')
    cy.get("*[data-testid=obs-port]").type("{selectall}1234")
    cy.get("*[data-testid=obs-submit]").should('be.enabled')
  })

  it('can save', () => {
    cy.get("*[data-testid=obs-ip]").type("{selectall}127.0.0.1")
    cy.get("*[data-testid=obs-port]").type("{selectall}9876")
    cy.get("*[data-testid=obs-submit]").click()

    cy.reload()
    cy.get("*[data-testid=obs-ip] input").should('have.value', "127.0.0.1")
    cy.get("*[data-testid=obs-port] input").should("have.value", "9876")
  })
})