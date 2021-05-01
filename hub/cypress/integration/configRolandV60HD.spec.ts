/// <reference types="Cypress" />
/// <reference types="../support" />

describe('Check Roland V-60HD Configuration', () => {
  beforeEach(() => {
    cy.visit('/config')
    cy.getTestId("page-config")

    cy.get("*[data-testid=mixer-select] select").select('rolandV60HD')

    cy.getTestId("rolandV60HD")
  })
  afterEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=mixer-select] select").select('test')
    cy.getTestId("test-submit").click()
  })

  it('respects validation rules', () => {
    cy.getTestId("rolandV60HD-submit").should('be.enabled')

    // ip
    cy.getTestId("rolandV60HD-ip").type("{selectall}foobar")
    cy.getTestId("rolandV60HD-submit").should('be.disabled')
    cy.getTestId("rolandV60HD-ip").type("{selectall}123.456.78.9")
    cy.getTestId("rolandV60HD-submit").should('be.disabled')
    cy.getTestId("rolandV60HD-ip").type("{selectall}1.2.3.4")
    cy.getTestId("rolandV60HD-submit").should('be.enabled')

    // request interval
    cy.getTestId("rolandV60HD-requestInterval").type("{selectall}foobar")
    cy.getTestId("rolandV60HD-submit").should('be.disabled')
    cy.getTestId("rolandV60HD-requestInterval").type("{selectall}42,5")
    cy.getTestId("rolandV60HD-submit").should('be.enabled')
    cy.getTestId("rolandV60HD-requestInterval").type("{selectall}42.5")
    cy.getTestId("rolandV60HD-submit").should('be.enabled')
    cy.getTestId("rolandV60HD-requestInterval").type("{selectall}100")
    cy.getTestId("rolandV60HD-submit").should('be.enabled')

  })

  it('can save', () => {
    cy.getTestId("rolandV60HD-requestInterval").type("{selectall}200")
    cy.getTestId("rolandV60HD-submit").click()

    cy.reload()
    cy.get("*[data-testid=rolandV60HD-requestInterval] input").should('have.value', "200")
  })
})
