/// <reference types="Cypress" />
/// <reference types="../support" />
import { socket } from '../../src/hooks/useSocket'
import { DefaultTallyConfiguration } from '../../src/tally/TallyConfiguration'
import { setSliderValue, validateSliderValue } from '../browserlib/sliderTestTool'

describe('Check Default Tally Configuration', () => {
  beforeEach(() => {
    cy.visit('/config')
    cy.getTestId("page-config")
  })

  it('can save', () => {
    socket.emit('config.change.tallyconfig', (new DefaultTallyConfiguration()).toJson())

    setSliderValue("*[data-testid=tally-defaults-ob]", 80)
    validateSliderValue("*[data-testid=tally-defaults-ob]", 80)
    setSliderValue("*[data-testid=tally-defaults-sb]", 70)
    validateSliderValue("*[data-testid=tally-defaults-sb]", 70)
    cy.getTestId("tally-defaults-oc-yellow-pink").click()
    cy.getTestId("tally-defaults-sc-yellow-pink").click()
    cy.getTestId("tally-defaults-sp").click()
    cy.getTestId("tally-defaults-submit").click()

    cy.reload().then(() => {
      validateSliderValue("*[data-testid=tally-defaults-ob]", 80)
      validateSliderValue("*[data-testid=tally-defaults-sb]", 70)
      cy.getTestId("tally-defaults-oc").should('have.attr', 'data-value', 'yellow-pink')
      cy.getTestId("tally-defaults-sc").should('have.attr', 'data-value', 'yellow-pink')
      cy.getTestId("tally-defaults-sp").should('have.attr', 'data-value', 'false')
    })
  })

  it('can not select a value below 20 for operator light', () => {
    setSliderValue("*[data-testid=tally-defaults-ob]", 20)
    validateSliderValue("*[data-testid=tally-defaults-ob]", 20).then(() => {
      setSliderValue("*[data-testid=tally-defaults-ob]", 15)
      validateSliderValue("*[data-testid=tally-defaults-ob]", 20).then(() => {
        setSliderValue("*[data-testid=tally-defaults-ob]", 0)
        validateSliderValue("*[data-testid=tally-defaults-ob]", 20)
      })
    })
  })

  it('updates the UI when configuration changes', () => {
    // setup
    const config = new DefaultTallyConfiguration()
    socket.emit('config.change.tallyconfig', config.toJson())

    cy.getTestId("tally-defaults-oc").should('have.attr', 'data-value', 'default')
    cy.getTestId("tally-defaults-sc").should('have.attr', 'data-value', 'default')
    cy.getTestId("tally-defaults-sp").should('have.attr', 'data-value', 'true')
    validateSliderValue("*[data-testid=tally-defaults-ob]", 100)
    validateSliderValue("*[data-testid=tally-defaults-sb]", 100).then(() => {
      // change settings from server
      config.setOperatorLightBrightness(42)
      config.setStageLightBrightness(21)
      config.setOperatorColorScheme("yellow-pink")
      config.setStageColorScheme("default")
      config.setStageShowsPreview(false)
      socket.emit('config.change.tallyconfig', config.toJson())

      cy.getTestId("tally-defaults-oc").should('have.attr', 'data-value', 'yellow-pink')
      cy.getTestId("tally-defaults-sc").should('have.attr', 'data-value', 'default')
      cy.getTestId("tally-defaults-sp").should('have.attr', 'data-value', 'false')
      validateSliderValue("*[data-testid=tally-defaults-ob]", 42)
      validateSliderValue("*[data-testid=tally-defaults-sb]", 21).then(() => {
        cy.getTestId("tally-defaults-oc-default").click()
        cy.getTestId("tally-defaults-sc-default").click()
        cy.getTestId("tally-defaults-sp").click()
        setSliderValue("*[data-testid=tally-defaults-ob]", 80)
        setSliderValue("*[data-testid=tally-defaults-sb]", 70).then(() => {
          // ... then change settings from server again
          config.setOperatorLightBrightness(75)
          config.setStageLightBrightness(75)
          config.setOperatorColorScheme("yellow-pink")
          config.setStageColorScheme("yellow-pink")
          config.setStageShowsPreview(false)
          socket.emit('config.change.tallyconfig', config.toJson())

          cy.getTestId("tally-defaults-oc").should('have.attr', 'data-value', 'yellow-pink')
          cy.getTestId("tally-defaults-sc").should('have.attr', 'data-value', 'yellow-pink')
          cy.getTestId("tally-defaults-sp").should('have.attr', 'data-value', 'false')
          validateSliderValue("*[data-testid=tally-defaults-ob]", 75)
          validateSliderValue("*[data-testid=tally-defaults-sb]", 75)
        })
      })
    })
  })

  it.skip('operator light brightness should dim an operator light')
  it.skip('stage light brightness should dim a stage light')
  it.skip('it persists the settings through restart')
})
