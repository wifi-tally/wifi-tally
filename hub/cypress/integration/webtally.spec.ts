/// <reference types="Cypress" />

import { socket } from '../../src/hooks/useSocket'
import randomTallyName from '../browserlib/randomTallyName'

describe('Web Tally Creation', () => {

  let createdTallies = []
  const registerRandomTallyName = () => {
    const name = randomTallyName()
    createdTallies.push(name)
    return name
  }

  beforeEach(() => {
    cy.visit('/')
    cy.get("*[data-testid=page-index]")
    createdTallies = []
  })
  afterEach(() => {
    cy.task('tallyCleanup')
    createdTallies.forEach(name => cy.task('tallyKill', name))
    createdTallies = []
  })

  it('can create an unpatched web tally', () => {
    const name = registerRandomTallyName()
    cy.get('*[data-testid=tally-create]').click()
    cy.get('*[data-testid=tally-create-popup]')
    cy.get('*[data-testid=tally-create-name]').type('{selectall}' + name)
    cy.get('*[data-testid=tally-create-ok]').click()

    // pop up should close
    cy.get('*[data-testid=tally-create-popup]').should('not.exist')
    cy.get(`*[data-testid=tally-${name}]`).contains(name)
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'unpatched')
  })
  it('can create a patched web tally', () => {
    const name = registerRandomTallyName()
    cy.get('*[data-testid=tally-create]').click()
    cy.get('*[data-testid=tally-create-popup]')
    cy.get('*[data-testid=tally-create-name]').type('{selectall}' + name)
    cy.get(`*[data-testid=tally-create-popup] *[data-testid=channel-selector] select`).select("Channel 1")
    cy.get('*[data-testid=tally-create-ok]').click()

    // pop up should close
    cy.get('*[data-testid=tally-create-popup]').should('not.exist')
    cy.get(`*[data-testid=tally-${name}]`).contains(name)
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'idle')
    cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] :selected`).contains("Channel 1")
  })

  it('only shows the warning when no UDP tallies are configured', () => {
    // it should be shown if no UDP tally exists
    cy.get('*[data-testid=tally-create]').click()
    cy.get('*[data-testid=tally-create-popup]')
    cy.get('*[data-testid=tally-create-warning]').should('exist')
    cy.get('*[data-testid=tally-create-cancel]').click()
    cy.get('*[data-testid=tally-create-popup]').should('not.exist')

    // it should not be shown if UDP tallies exist
    const udpName = randomTallyName()
    cy.task('tally', udpName)
    cy.get('*[data-testid=tally-create]').click()
    cy.get('*[data-testid=tally-create-warning]').should('not.exist')
  })

  it('can not create tallies with invalid names', () => {
    const udpName = randomTallyName()
    cy.task('tally', udpName)

    cy.get('*[data-testid=tally-create]').click()
    // disabled because empty
    cy.get('*[data-testid=tally-create-name]').type('{selectall}{del}')
    cy.get('*[data-testid=tally-create-ok]').should('be.disabled')

    // allowed because ok name
    cy.get('*[data-testid=tally-create-name]').type('{selectall}' + randomTallyName())
    cy.get('*[data-testid=tally-create-ok]').should('not.be.disabled')

    // disabled because too long
    cy.get('*[data-testid=tally-create-name]').type('123456788901234567890')
    cy.get('*[data-testid=tally-create-ok]').should('be.disabled')

    // disabled because already existant name
    cy.get('*[data-testid=tally-create-name]').type('{selectall}' + udpName)
    cy.get('*[data-testid=tally-create-ok]').should('be.disabled')

    // ok, because does not match an existant name
    cy.get('*[data-testid=tally-create-name]').type('{backspace}')
    cy.get('*[data-testid=tally-create-ok]').should('not.be.disabled')
  })

  it('Udp Tally and Web Tally with same name can co-exist', () => {
    const name = randomTallyName()
    cy.task('tally', name)
    socket.emit('tally.create', name)

    cy.get(`*[data-testid=tally-${name}]`).should('have.length', 2)

  })
})