/// <reference types="Cypress" />
/// <reference types="../support" />

describe('Check Wirecast Configuration', () => {
  beforeEach(() => {
    cy.visit('/config')
    cy.getTestId("page-config")

    cy.get("*[data-testid=mixer-select] select").select('wirecast')

    cy.getTestId("wirecast")
  })
  afterEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=mixer-select] select").select('test')
    cy.getTestId("test-submit").click()
  })

  it('respects validation rules', () => {
    cy.getTestId("wirecast-submit").should('be.enabled')

    // ip
    cy.getTestId("wc-ip").type("{selectall}foobar")
    cy.getTestId("wirecast-submit").should('be.disabled')
    cy.getTestId("wc-ip").type("{selectall}123.456.78.9")
    cy.getTestId("wirecast-submit").should('be.disabled')
    cy.getTestId("wc-ip").type("{selectall}1.2.3.4")
    cy.getTestId("wirecast-submit").should('be.enabled')

    // port
    cy.getTestId("wc-port").type("{selectall}-1000")
    cy.getTestId("wirecast-submit").should('be.disabled')
    cy.getTestId("wc-port").type("{selectall}invalid")
    cy.getTestId("wirecast-submit").should('be.disabled')
    cy.getTestId("wc-port").type("{selectall}9999")
    cy.getTestId("wirecast-submit").should('be.enabled')
    cy.getTestId("wc-port").type("9")
    cy.getTestId("wirecast-submit").should('be.disabled')
    cy.getTestId("wc-port").type("{selectall}1234")
    cy.getTestId("wirecast-submit").should('be.enabled')

    // liveMode
    cy.getTestId("wc-liveMode").find("select").select('record')
    cy.getTestId("wirecast-submit").should('be.enabled')
    cy.getTestId("wc-liveMode").find("select").select('always')
    cy.getTestId("wirecast-submit").should('be.enabled')

    // layers
    cy.getTestId("wc-layers-1").should('have.attr', 'data-selected', 'true').click()
    cy.getTestId("wc-layers-2").should('have.attr', 'data-selected', 'true').click()
    cy.getTestId("wc-layers-3").should('have.attr', 'data-selected', 'true').click()
    cy.getTestId("wc-layers-4").should('have.attr', 'data-selected', 'true').click()
    cy.getTestId("wirecast-submit").should('be.enabled')
    cy.getTestId("wc-layers-5").should('have.attr', 'data-selected', 'true').click()
    cy.getTestId("wirecast-submit").should('be.disabled')
    cy.getTestId("wc-layers-5").should('have.attr', 'data-selected', 'false').click()
    cy.getTestId("wirecast-submit").should('be.enabled')
  })

  it('can save', () => {
    cy.getTestId("wc-ip").type("{selectall}127.0.0.1")
    cy.getTestId("wc-port").type("{selectall}4242")
    cy.getTestId("wc-liveMode").find("select").select('stream')
    cy.getTestId("wc-layers-1").click()
    cy.getTestId("wc-layers-4").click()
    cy.getTestId("wc-layers-5").click()
    cy.getTestId("wirecast-submit").click()

    cy.reload()
    cy.get("*[data-testid=wc-ip] input").should('have.value', "127.0.0.1")
    cy.get("*[data-testid=wc-port] input").should("have.value", "4242")
    cy.get("*[data-testid=wc-liveMode] select :selected").should("have.value", "stream")
    cy.getTestId("wc-layers-1").should('have.attr', 'data-selected', 'false')
    cy.getTestId("wc-layers-2").should('have.attr', 'data-selected', 'true')
    cy.getTestId("wc-layers-3").should('have.attr', 'data-selected', 'true')
    cy.getTestId("wc-layers-4").should('have.attr', 'data-selected', 'false')
    cy.getTestId("wc-layers-5").should('have.attr', 'data-selected', 'false')
  })
})