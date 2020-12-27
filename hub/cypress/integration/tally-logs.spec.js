/// <reference types="Cypress" />

import randomTallyName from '../browserlib/randomTallyName'

describe('Tally Log display', () => {

  let tallyName

  beforeEach(() => {
    tallyName = randomTallyName()
    cy.task('tally', tallyName)
    cy.visit(`/tally/${tallyName}/log`)
    cy.get(`*[data-testid=page-tally-log]`)
  })
  afterEach(() => {
    cy.task('tallyCleanup')
  })

  it('should be linked from the tally list', () => {
    cy.visit('/')
    
    cy.get(`*[data-testid=tally-${tallyName}]`).contains(tallyName)
    cy.get(`*[data-testid=tally-${tallyName}-menu]`).click()
    cy.get(`*[data-testid=tally-${tallyName}-logs]`).click()

    cy.get(`*[data-testid=page-tally-log]`)
  })

  it('should show logs', () => {
    cy.task('tallyLog', {name: tallyName, message: "Hello World", severity: "INFO"})
    cy.contains('*[data-severity=info]', "Hello World")
    
    cy.task('tallyLog', {name: tallyName, message: "This is your first warning", severity: "WARN"})
    cy.contains('*[data-severity=warning]', "This is your first warning")

    cy.task('tallyLog', {name: tallyName, message: "This is your second warning", severity: "WARN"})
    cy.contains('*[data-severity=warning]', "This is your second warning")

    cy.task('tallyLog', {name: tallyName, message: "Well, THAT does it!!", severity: "ERROR"})
    cy.contains('*[data-severity=error]', "Well, THAT does it!!")

    cy.task('tallyDisconnect', tallyName)
    cy.contains('*[data-severity=status]', "Tally got missing")
    // and a few moments later
    cy.contains('*[data-severity=status]', "Tally got disconnected")
  })
})