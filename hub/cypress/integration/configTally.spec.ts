/// <reference types="Cypress" />
import { socket } from '../../src/hooks/useSocket'
import { DefaultTallyConfiguration } from '../../src/tally/TallyConfiguration'

describe('Check Default Tally Configuration', () => {
  beforeEach(() => {
    cy.visit('/config')
    cy.get("*[data-testid=page-config]")
  })

  const setSliderValue = (selector: string, value: number) => {
    // eslint-disable-next-line cypress/no-assigning-return-values
    let chain = cy.get(`${selector} *[role=slider]`)
      .trigger('keydown', { keyCode: 35, which: 35 }) // End
    let currentValue = 100
    while (value < currentValue) {
      if (currentValue - value >= 10) {
        chain = chain.trigger('keydown', { keyCode: 34, which: 34 }) // PageDown
        currentValue -= 10
      } else {
        chain = chain.trigger('keydown', { keyCode: 37, which: 37 }) // ArrowLeft
        currentValue -= 1
      }
    }
    return chain
  }

  const validateSliderValue = (selector: string, value: number) => {
    return cy.get(`${selector} *[role=slider]`).should('have.attr', 'aria-valuenow', value.toString())
  }

  it('can save', () => {
    setSliderValue("*[data-testid=tally-defaults-ob]", 80)
    validateSliderValue("*[data-testid=tally-defaults-ob]", 80)
    setSliderValue("*[data-testid=tally-defaults-sb]", 70)
    validateSliderValue("*[data-testid=tally-defaults-sb]", 70)
    cy.get("*[data-testid=tally-defaults-submit]").click()

    cy.reload().then(() => {
      validateSliderValue("*[data-testid=tally-defaults-ob]", 80)
      validateSliderValue("*[data-testid=tally-defaults-sb]", 70)
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
    config.setOperatorLightBrightness(100)
    config.setStageLightBrightness(100)
    socket.emit('config.change.tallyconfig', config.toJson())

    validateSliderValue("*[data-testid=tally-defaults-ob]", 100)
    validateSliderValue("*[data-testid=tally-defaults-sb]", 100).then(() => {
      // change settings from server
      config.setOperatorLightBrightness(42)
      config.setStageLightBrightness(21)
      socket.emit('config.change.tallyconfig', config.toJson())

      validateSliderValue("*[data-testid=tally-defaults-ob]", 42)
      validateSliderValue("*[data-testid=tally-defaults-sb]", 21).then(() => {
        setSliderValue("*[data-testid=tally-defaults-ob]", 80)
        setSliderValue("*[data-testid=tally-defaults-sb]", 70).then(() => {
          // ... then change settings from server again
          config.setOperatorLightBrightness(75)
          config.setStageLightBrightness(75)
          socket.emit('config.change.tallyconfig', config.toJson())
          validateSliderValue("*[data-testid=tally-defaults-ob]", 75)
          validateSliderValue("*[data-testid=tally-defaults-sb]", 75)
        })
      })
    })
  })

  it.skip('operator light brightness should dim an operator light')
  it.skip('stage light brightness should dim a stage light')
})
