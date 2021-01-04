/// <reference types="Cypress" />

import randomTallyName from '../browserlib/randomTallyName'
import { socket } from '../../src/hooks/useSocket'
import { DefaultTallyConfiguration, TallyConfiguration } from '../../src/tally/TallyConfiguration'
import { setSliderValue, validateSliderValue } from '../browserlib/sliderTestTool'

describe('Tally Settings', () => {

  let createdTallies = []
  const registerRandomTallyName = () => {
    const name = randomTallyName()
    createdTallies.push(name)
    return name
  }

  beforeEach(() => {
    cy.visit('/')
    cy.get("*[data-testid=page-index]")

    // start with default settings
    const settings = new DefaultTallyConfiguration()
    socket.emit('config.change.tallyconfig', settings.toJson())
  })
  afterEach(() => {
    cy.task('tallyCleanup')
    createdTallies.forEach(name => cy.task('tallyKill', name))
    createdTallies = []
  })

  it('does not show stage light relevant settings for a web tally', () => {
    const name = registerRandomTallyName()
    socket.emit('tally.create', name)

    cy.get(`*[data-testid=tally-${name}]`).contains(name)
    cy.get(`*[data-testid=tally-${name}-menu]`).click()
    cy.get(`*[data-testid=tally-${name}-settings]`).click()

    cy.get(`*[data-testid=tally-settings-popup]`)
    cy.get("*[data-testid=tally-defaults-ob]").should('exist')
    cy.get("*[data-testid=tally-defaults-sb]").should('not.exist')
  })

  it('can open settings for an udp tally', () => {
    const name = randomTallyName()
    cy.task('tally', name)

    cy.get(`*[data-testid=tally-${name}]`).contains(name)
    cy.get(`*[data-testid=tally-${name}-menu]`).click()
    cy.get(`*[data-testid=tally-${name}-settings]`).click()

    cy.get(`*[data-testid=tally-settings-popup]`)
    cy.get("*[data-testid=tally-defaults-ob]").should('exist')
    cy.get("*[data-testid=tally-defaults-sb]").should('exist')
  })

  it('can edit and save settings for an udp tally', () => {
    const name = randomTallyName()
    cy.task('tally', name)

    cy.get(`*[data-testid=tally-${name}]`).contains(name)
    cy.get(`*[data-testid=tally-${name}-menu]`).click()
    cy.get(`*[data-testid=tally-${name}-settings]`).click()

    cy.get(`*[data-testid=tally-settings-popup]`)

    // by default every setting should use the default
    cy.get(`*[data-testid=tally-defaults-ob-toggle] input`)
      .should('be.checked')
      .click()
    cy.get(`*[data-testid=tally-defaults-sb-toggle] input`)
      .should('be.checked')
      .click()
    // and it should show the default
    validateSliderValue("*[data-testid=tally-defaults-ob]", 100)
    validateSliderValue("*[data-testid=tally-defaults-sb]", 100).then(() => {
      // and when we change values
      setSliderValue("*[data-testid=tally-defaults-ob]", 80)
      setSliderValue("*[data-testid=tally-defaults-sb]", 70)
    }).then(() => {
      // and save
      cy.get(`*[data-testid=tally-settings-submit]`).click()

      // and then reload the page
      cy.reload()
      cy.get(`*[data-testid=tally-${name}]`).contains(name)
      cy.get(`*[data-testid=tally-${name}-menu]`).click()
      cy.get(`*[data-testid=tally-${name}-settings]`).click()

      // they should show up
      cy.get(`*[data-testid=tally-defaults-ob-toggle] input`).should('not.be.checked')
      validateSliderValue("*[data-testid=tally-defaults-ob]", 80)
      
      cy.get(`*[data-testid=tally-defaults-sb-toggle] input`).should('not.be.checked')
      validateSliderValue("*[data-testid=tally-defaults-sb]", 70)
    })
  })

  it('can restore default settings for an udp tally', () => {
    const name = randomTallyName()
    cy.task('tally', name)
    const initialConfig = new TallyConfiguration()
    initialConfig.setOperatorLightBrightness(80)
    initialConfig.setStageLightBrightness(70)
    
    cy.get(`*[data-testid=tally-${name}]`).contains(name).then(() => {
      socket.emit('tally.settings', name, "udp", initialConfig.toJson())
    })
    cy.get(`*[data-testid=tally-${name}-menu]`).click()
    cy.get(`*[data-testid=tally-${name}-settings]`).click()


    cy.get(`*[data-testid=tally-settings-popup]`)

    // it should show our configuration
    validateSliderValue("*[data-testid=tally-defaults-ob]", 80)
    validateSliderValue("*[data-testid=tally-defaults-sb]", 70).then(() => {
      // and when we toggle the defaults back on
      cy.get(`*[data-testid=tally-defaults-ob-toggle] input`)
        .should('not.be.checked')
        .click()
      cy.get(`*[data-testid=tally-defaults-sb-toggle] input`)
        .should('not.be.checked')
        .click()
      // it should show the default value
      validateSliderValue("*[data-testid=tally-defaults-ob]", 100)
      validateSliderValue("*[data-testid=tally-defaults-sb]", 100)
    }).then(() => {
      // when we save
      cy.get(`*[data-testid=tally-settings-submit]`).click()

      // and reload
      cy.reload()
      cy.get(`*[data-testid=tally-${name}]`).contains(name)
      cy.get(`*[data-testid=tally-${name}-menu]`).click()
      cy.get(`*[data-testid=tally-${name}-settings]`).click()

      // it should use the defaults
      cy.get(`*[data-testid=tally-defaults-ob-toggle] input`).should('be.checked')
      validateSliderValue("*[data-testid=tally-defaults-ob]", 100)
      
      cy.get(`*[data-testid=tally-defaults-sb-toggle] input`).should('be.checked')
      validateSliderValue("*[data-testid=tally-defaults-sb]", 100)
    })
  })

  it('updates the UI if tally settings are changed', () => {
    const name = randomTallyName()
    cy.task('tally', name)
    const ourConfig = new TallyConfiguration()
    ourConfig.setOperatorLightBrightness(80)
    ourConfig.setStageLightBrightness(70)

    cy.get(`*[data-testid=tally-${name}]`).contains(name).then(() => {
      socket.emit('tally.settings', name, "udp", ourConfig.toJson())
    })
    cy.get(`*[data-testid=tally-${name}-menu]`).click()
    cy.get(`*[data-testid=tally-${name}-settings]`).click()
    cy.get(`*[data-testid=tally-settings-popup]`)
    validateSliderValue("*[data-testid=tally-defaults-ob]", 80)
    validateSliderValue("*[data-testid=tally-defaults-sb]", 70).then(() => {
      // we change the settings from Hub without manual changes
      ourConfig.setOperatorLightBrightness(40)
      ourConfig.setStageLightBrightness(30)
      socket.emit('tally.settings', name, "udp", ourConfig.toJson())

      validateSliderValue("*[data-testid=tally-defaults-ob]", 40)
      validateSliderValue("*[data-testid=tally-defaults-sb]", 30)
    }).then(() => {
      // we change the values from UI, but not saving
      setSliderValue("*[data-testid=tally-defaults-ob]", 99)
      setSliderValue("*[data-testid=tally-defaults-sb]", 98)

      validateSliderValue("*[data-testid=tally-defaults-ob]", 99)
      validateSliderValue("*[data-testid=tally-defaults-sb]", 98)
    }).then(() => {
      // then changes from the server should override our changes
      ourConfig.setOperatorLightBrightness(50)
      ourConfig.setStageLightBrightness(25)
      socket.emit('tally.settings', name, "udp", ourConfig.toJson())

      validateSliderValue("*[data-testid=tally-defaults-ob]", 50)
      validateSliderValue("*[data-testid=tally-defaults-sb]", 25)
    })
  })

  it('updates the UI if default tally settings are changed', () => {
    const name = randomTallyName()
    cy.task('tally', name)
    const defaultConfig = new DefaultTallyConfiguration()

    cy.get(`*[data-testid=tally-${name}]`).contains(name)
    cy.get(`*[data-testid=tally-${name}-menu]`).click()
    cy.get(`*[data-testid=tally-${name}-settings]`).click()
    cy.get(`*[data-testid=tally-settings-popup]`)

    // initial check that we use the default
    cy.get(`*[data-testid=tally-defaults-ob-toggle] input`).should('be.checked')
    validateSliderValue("*[data-testid=tally-defaults-ob]", 100)
    cy.get(`*[data-testid=tally-defaults-sb-toggle] input`).should('be.checked')
    validateSliderValue("*[data-testid=tally-defaults-sb]", 100).then(() => {
      defaultConfig.setOperatorLightBrightness(70)
      defaultConfig.setStageLightBrightness(66)
      socket.emit('config.change.tallyconfig', defaultConfig.toJson())
      validateSliderValue("*[data-testid=tally-defaults-ob]", 70)
      validateSliderValue("*[data-testid=tally-defaults-sb]", 66)
    })
  })

  it.skip('it persists the settings through restart')
})