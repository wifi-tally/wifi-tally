/// <reference types="Cypress" />
/// <reference types="../support" />

import randomTallyName from '../browserlib/randomTallyName'
import TestConfiguration from '../../src/mixer/test/TestConfiguration'
import { socket } from '../../src/hooks/useSocket'

describe('Tally display', () => {
  beforeEach(() => {
    cy.visit('/flasher')
    cy.getTestId("page-flasher")
    // wait for error text before mocking
    cy.get("body").should('contain.text', 'Did not find any connected device')
  })
  afterEach(() => {
  })

  it.skip("TODO")
})