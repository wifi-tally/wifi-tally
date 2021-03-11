/// <reference types="cypress" />

type CypressOptions = Partial<Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow>

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-testid attribute.
     * @example cy.getTestId('greeting')
    */
    getTestId(testId: string, options?: CypressOptions): Chainable<Element>
  }
}