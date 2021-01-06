/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-testid attribute.
     * @example cy.getTestId('greeting')
    */
    getTestId(testId: string): Chainable<Element>
  }
}