/// <reference types="Cypress" />
/// <reference types="../support" />

describe('Check Roland V-8HD Configuration', () => {
  beforeEach(() => {
    cy.visit('/config')
    cy.getTestId("page-config")

    cy.get("*[data-testid=mixer-select] select").select('rolandV8HD')

    cy.getTestId("rolandV8HD")
  })
  afterEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=mixer-select] select").select('test')
    cy.getTestId("test-submit").click()
  })

  it('respects validation rules', () => {
    cy.getTestId("rolandV8HD-submit").should('be.enabled')

    // request interval
    cy.getTestId("rolandV8HD-request-interval").type("{selectall}foobar")
    cy.getTestId("rolandV8HD-submit").should('be.disabled')
    cy.getTestId("rolandV8HD-request-interval").type("{selectall}42,5")
    cy.getTestId("rolandV8HD-submit").should('be.enabled')
    cy.getTestId("rolandV8HD-request-interval").type("{selectall}42.5")
    cy.getTestId("rolandV8HD-submit").should('be.enabled')
    cy.getTestId("rolandV8HD-request-interval").type("{selectall}100")
    cy.getTestId("rolandV8HD-submit").should('be.enabled')

  })

  it('can save', () => {
    cy.getTestId("rolandV8HD-request-interval").type("{selectall}200")
    cy.getTestId("rolandV8HD-submit").click()

    cy.reload()
    cy.get("*[data-testid=rolandV8HD-request-interval] input").should('have.value', "200")
  })
})
