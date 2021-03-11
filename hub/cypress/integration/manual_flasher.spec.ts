/// <reference types="Cypress" />
/// <reference types="../support" />

describe('Live Flasher', () => {
  before(() => {
    cy.log(`This test expects you to plug an unflashed Tally Light via USB. Plug it now and make sure it does not have any files on it. "nodemcu-tool mkfs" is an easy way to do it.`).pause()
  })
  beforeEach(() => {
    cy.visit('/flasher')
    cy.get("*[data-testid=page-flasher]")
  })

  it('can flash the software', () => {
    cy.getTestId("update-software")
    cy.getTestId("progress").should('not.exist')
    cy.getTestId("update-software-now").click()
    cy.getTestId("progress").should('be.visible')
    cy.getTestId("progress-close").should('be.disabled')

    cy.getTestId("progress-step-initialize").should('have.attr', 'data-done', "true")
    cy.getTestId("progress-step-connection").should('have.attr', 'data-done', "true")
    // the upload step can take quite some time
    cy.getTestId("progress-step-upload", {timeout: 60000}).should('have.attr', 'data-done', "true")
    cy.getTestId("progress-step-reboot", {timeout: 15000}).should('have.attr', 'data-done', "true")
    cy.getTestId("progress-step-done").should('have.attr', 'data-done', "true")

    cy.getTestId("progress-close").should('be.enabled').click()
    cy.getTestId("progress").should('not.exist')

    cy.getTestId("update-software").should('contain.text', 'The software on this Tally is up to date.')

    // ... and it should not change after a reload

    cy.reload()
    cy.getTestId("update-software").should('contain.text', 'The software on this Tally is up to date.')
  })

  it('can write tally-settings.ini', () => {
    const name = "My Test Tally"
    const ssid = "This is my WiFi"
    const password = "SuperSecretPa$$w0rd"
    const ip = "10.0.0.0"
    const port = "4711"

    cy.getTestId("tally-settings")
    cy.getTestId("progress").should('not.exist')

    cy.getTestId("tally-settings-expert").should("have.attr", "data-expertmode", "false").click()
    cy.getTestId("tally-settings-expert").should("have.attr", "data-expertmode", "true")
    cy.getTestId("tally-settings-all").find("textarea").should("have.value", "").then(() => {
      cy.getTestId("tally-settings-expert").click()
    })
    
    cy.getTestId("tally-settings-name").find("input").should("have.value", "").type('{selectall}' + name)
    cy.getTestId("tally-settings-ssid").find("input").should("have.value", "").type('{selectall}' + ssid)
    cy.getTestId("tally-settings-password").find("input").should("have.value", "").type('{selectall}' + password)
    cy.getTestId("tally-settings-ip").find("input").should("have.value", "").type('{selectall}' + ip)
    cy.getTestId("tally-settings-port").find("input").should("have.value", "").type('{selectall}' + port)

    cy.getTestId("tally-settings-expert").should("have.attr", "data-expertmode", "false").click()
    cy.getTestId("tally-settings-expert").should("have.attr", "data-expertmode", "true")
    cy.getTestId("tally-settings-all").find("textarea").should("contain.text", "tally.name=" + name).then(() => {
      cy.getTestId("tally-settings-expert").click()
    }).then(() => {
      cy.getTestId("tally-settings-submit").click()
    })

    // valid progress
    cy.getTestId("progress").should('be.visible')
    cy.getTestId("progress-close").should('be.disabled')

    cy.getTestId("progress-step-initialize").should('have.attr', 'data-done', "true")
    cy.getTestId("progress-step-connection").should('have.attr', 'data-done', "true")
    // the upload step can take quite some time
    cy.getTestId("progress-step-upload", {timeout: 15000}).should('have.attr', 'data-done', "true")
    cy.getTestId("progress-step-reboot", {timeout: 15000}).should('have.attr', 'data-done', "true")
    cy.getTestId("progress-step-done").should('have.attr', 'data-done', "true")

    // ignore "connected" step, because it would require a working WiFi

    cy.getTestId("progress-close").should('be.enabled').click()
    cy.getTestId("progress").should('not.exist')

    // verify the values are still there
    cy.getTestId("tally-settings-name").find("input").should("have.value", name)

    // ...even after reload
    cy.reload()
    cy.getTestId("tally-settings-name").find("input").should("have.value", name)
  })
})