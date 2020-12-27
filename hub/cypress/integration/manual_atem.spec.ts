/// <reference types="Cypress" />
import { socket } from '../../../src/hooks/useSocket'

describe('Live AtemCheck', () => {
  let ip: string
  let port: number
  before(() => {
    ip = Cypress.env('atem_ip')
    port = parseInt(Cypress.env('atem_port'), 10)
    cy.log(`This test expects an ATEM Video Mixer to run at ${ip}:${port}. See "cypress.json" to change these values.`)
    cy.task('atemConnect', {ip, port})
  })
  after(() => {
    cy.task('atemDisconnect')
  })
  beforeEach(() => {
    cy.task('tally', "Tally01").then(() => {
      socket.emit('tally.patch', "Tally01", "1")
    })
    cy.task('tally', "Tally02").then(() => {
      socket.emit('tally.patch', "Tally02", "2")
    })
    cy.task('tally', "Tally03").then(() => {
      socket.emit('tally.patch', "Tally03", "3")
    })
    cy.task('tally', "Tally04").then(() => {
      socket.emit('tally.patch', "Tally04", "4")
    })
  })
  afterEach(() => {
    cy.task('tallyCleanup')
  })

  it('can be configured', () => {
    cy.visit('/config')
    cy.get("*[data-testid=page-config]")

    // select the null mixer first to disconnect anything from before
    cy.get("*[data-testid=mixer-select] select").select('null')
    cy.get("*[data-testid=null]")
    cy.get("*[data-testid=null-submit]").click()

    cy.visit('/')
    cy.get("*[data-testid=mixer-connected]").contains("0")

    cy.visit('/config')
    cy.get("*[data-testid=page-config]")
    cy.get("*[data-testid=mixer-select] select").select('atem')
    cy.get("*[data-testid=atem]")
    cy.get("*[data-testid=atem-ip]").type(`{selectall}${ip}`)
    cy.get("*[data-testid=atem-port]").type(`{selectall}${port}`)
    cy.get("*[data-testid=atem-submit]").click()

    cy.visit('/')
    cy.get("*[data-testid=mixer-connected]").contains("1")
  })

  it('shows the correct state', () => {
    cy.visit('/')
    
    cy.task('atemProgram', 1)
    cy.task('atemPreview', 2)
    cy.get(`*[data-testid=tally-Tally01]`).should('have.attr', 'data-color', 'program')
    cy.get(`*[data-testid=tally-Tally02]`).should('have.attr', 'data-color', 'preview')
    cy.get(`*[data-testid=tally-Tally03]`).should('have.attr', 'data-color', 'idle')
    cy.get(`*[data-testid=tally-Tally04]`).should('have.attr', 'data-color', 'idle')

    cy.task('atemProgram', 2)
    cy.task('atemPreview', 1)
    cy.get(`*[data-testid=tally-Tally01]`).should('have.attr', 'data-color', 'preview')
    cy.get(`*[data-testid=tally-Tally02]`).should('have.attr', 'data-color', 'program')
    cy.get(`*[data-testid=tally-Tally03]`).should('have.attr', 'data-color', 'idle')
    cy.get(`*[data-testid=tally-Tally04]`).should('have.attr', 'data-color', 'idle')
  })

  it('updates the channel names', () => {
    cy.visit('/')

    cy.task('atemChannelName', {channelId: 1, short: "FOO", long:"Foobar"})
    cy.get(`*[data-testid=tally-Tally01] *[data-testid=channel-selector] :selected`).contains("Foobar")
    cy.task('atemChannelName', {channelId: 1, short: "OTHER", long:"Hello World"})
    cy.get(`*[data-testid=tally-Tally01] *[data-testid=channel-selector] :selected`).contains("Hello World")
  })

  it('automatically reconnects', () => {
    cy.visit('/')
    
    cy.task('atemProgram', 1)
    cy.task('atemPreview', 2)
    cy.get(`*[data-testid=tally-Tally01]`).should('have.attr', 'data-color', 'program')
    cy.get(`*[data-testid=tally-Tally02]`).should('have.attr', 'data-color', 'preview')
    cy.get(`*[data-testid=tally-Tally03]`).should('have.attr', 'data-color', 'idle')
    cy.get(`*[data-testid=tally-Tally04]`).should('have.attr', 'data-color', 'idle')
    cy.get("*[data-testid=mixer-connected]").contains("1")

    cy.log("!!!Unplug the power of the ATEM Mixer now!!!").pause()
    cy.get("*[data-testid=mixer-connected]").contains("0", {timeout: 30000})

    // they hold the last state
    cy.get(`*[data-testid=tally-Tally01]`).should('have.attr', 'data-color', 'program')
    cy.get(`*[data-testid=tally-Tally02]`).should('have.attr', 'data-color', 'preview')
    cy.get(`*[data-testid=tally-Tally03]`).should('have.attr', 'data-color', 'idle')
    cy.get(`*[data-testid=tally-Tally04]`).should('have.attr', 'data-color', 'idle')

    cy.log("!!!Plug the ATEM Mixer again now!!!").pause()
    cy.get("*[data-testid=mixer-connected]").contains("1", {timeout: 30000})
  })
})