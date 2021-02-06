/// <reference types="Cypress" />
/// <reference types="../support" />

import randomTallyName from '../browserlib/randomTallyName'
import { socket } from '../../src/hooks/useSocket'
import { DefaultTallyConfiguration, TallyConfiguration } from '../../src/tally/TallyConfiguration'
import { setSliderValue, validateSliderValue } from '../browserlib/sliderTestTool'
import TestConfiguration from '../../src/mixer/test/TestConfiguration'

describe('Tally Settings', () => {

  let createdTallies = []
  const registerRandomTallyName = () => {
    const name = randomTallyName()
    createdTallies.push(name)
    return name
  }

  beforeEach(() => {
    cy.visit('/')
    cy.getTestId("page-index")

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

    cy.getTestId(`tally-${name}`).contains(name)
    cy.getTestId(`tally-${name}-menu`).click()
    cy.getTestId(`tally-${name}-settings`).click()

    cy.getTestId(`tally-settings`)
    cy.getTestId("tally-settings-ob").should('exist')
    cy.getTestId("tally-settings-sb").should('not.exist')
    cy.getTestId("tally-settings-oc").should('exist')
    cy.getTestId("tally-settings-sc").should('not.exist')
    cy.getTestId("tally-settings-sp").should('not.exist')
    cy.getTestId("tally-settings-oi").should('exist')
  })

  it('can open settings for an udp tally', () => {
    const name = randomTallyName()
    cy.task('tally', name)

    cy.getTestId(`tally-${name}`).contains(name)
    cy.getTestId(`tally-${name}-menu`).click()
    cy.getTestId(`tally-${name}-settings`).click()

    cy.getTestId(`tally-settings`)
    cy.getTestId("tally-settings-ob").should('exist')
    cy.getTestId("tally-settings-sb").should('exist')
    cy.getTestId("tally-settings-oc").should('exist')
    cy.getTestId("tally-settings-sc").should('exist')
    cy.getTestId("tally-settings-sp").should('exist')
    cy.getTestId("tally-settings-oi").should('exist')
  })

  it('can edit and save settings for an udp tally', () => {
    const name = randomTallyName()
    cy.task('tally', name)
    socket.emit('config.change.tallyconfig', (new DefaultTallyConfiguration()).toJson())

    cy.getTestId(`tally-${name}`).contains(name)
    cy.getTestId(`tally-${name}-menu`).click()
    cy.getTestId(`tally-${name}-settings`).click()

    cy.getTestId(`tally-settings`)

    // by default every setting should use the default
    cy.getTestId("tally-settings-ob-toggle")
      .should('have.attr', 'data-selected', 'true')
      .click()
    cy.getTestId("tally-settings-sb-toggle")
      .should('have.attr', 'data-selected', 'true')
      .click()
    cy.getTestId("tally-settings-oc-toggle")
      .should('have.attr', 'data-selected', 'true')
      .click()
    cy.getTestId("tally-settings-sc-toggle")
      .should('have.attr', 'data-selected', 'true')
      .click()
    cy.getTestId("tally-settings-sp-toggle")
      .should('have.attr', 'data-selected', 'true')
      .click()
    cy.getTestId("tally-settings-oi-toggle")
      .should('have.attr', 'data-selected', 'true')
      .click()
    // and it should show the default
    cy.getTestId("tally-settings-oc").should('have.attr', 'data-value', 'default')
    cy.getTestId("tally-settings-sc").should('have.attr', 'data-value', 'default')
    cy.getTestId("tally-settings-sp").should('have.attr', 'data-value', 'true')
    cy.getTestId("tally-settings-oi").should('have.attr', 'data-value', 'true')
    validateSliderValue("*[data-testid=tally-settings-ob]", 100)
    validateSliderValue("*[data-testid=tally-settings-sb]", 100).then(() => {
      // and when we change values
      setSliderValue("*[data-testid=tally-settings-ob]", 80)
      setSliderValue("*[data-testid=tally-settings-sb]", 70)
      cy.getTestId("tally-settings-oc-default").click()
      cy.getTestId("tally-settings-sc-yellow-pink").click()
      cy.getTestId("tally-settings-sp").click()
      cy.getTestId("tally-settings-oi").click()
    }).then(() => {
      // and save
      cy.getTestId(`tally-settings-submit`).click()

      // and then reload the page
      cy.reload()
      cy.getTestId(`tally-${name}`).contains(name)
      cy.getTestId(`tally-${name}-menu`).click()
      cy.getTestId(`tally-${name}-settings`).click()

      // they should show up
      cy.getTestId("tally-settings-ob-toggle").should('have.attr', 'data-selected', 'false')
      validateSliderValue("*[data-testid=tally-settings-ob]", 80)
      
      cy.getTestId("tally-settings-sb-toggle").should('have.attr', 'data-selected', 'false')
      validateSliderValue("*[data-testid=tally-settings-sb]", 70)

      cy.getTestId("tally-settings-oc-toggle").should('have.attr', 'data-selected', 'false')
      cy.getTestId("tally-settings-oc").should('have.attr', 'data-value', 'default')

      cy.getTestId("tally-settings-sc-toggle").should('have.attr', 'data-selected', 'false')
      cy.getTestId("tally-settings-sc").should('have.attr', 'data-value', 'yellow-pink')

      cy.getTestId("tally-settings-sp-toggle").should('have.attr', 'data-selected', 'false')
      cy.getTestId("tally-settings-sp").should('have.attr', 'data-value', 'false')

      cy.getTestId("tally-settings-oi-toggle").should('have.attr', 'data-selected', 'false')
      cy.getTestId("tally-settings-oi").should('have.attr', 'data-value', 'false')
    })
  })

  it('can restore default settings for an udp tally', () => {
    const name = randomTallyName()
    cy.task('tally', name)
    const initialConfig = new TallyConfiguration()
    initialConfig.setOperatorLightBrightness(80)
    initialConfig.setStageLightBrightness(70)
    initialConfig.setOperatorColorScheme("yellow-pink")
    initialConfig.setStageColorScheme("default")
    initialConfig.setStageShowsPreview(false)
    initialConfig.setOperatorShowsIdle(false)
    
    cy.getTestId(`tally-${name}`).contains(name).then(() => {
      socket.emit('tally.settings', name, "udp", initialConfig.toJson())
      socket.emit('config.change.tallyconfig', (new DefaultTallyConfiguration()).toJson())
    })
    cy.getTestId(`tally-${name}-menu`).click()
    cy.getTestId(`tally-${name}-settings`).click()


    cy.getTestId(`tally-settings`)

    // it should show our configuration
    validateSliderValue("*[data-testid=tally-settings-ob]", 80)
    validateSliderValue("*[data-testid=tally-settings-sb]", 70).then(() => {
      // and when we toggle the defaults back on

      cy.getTestId("tally-settings-ob-toggle")
        .should('have.attr', 'data-selected', 'false')
        .click()
      cy.getTestId("tally-settings-sb-toggle")
        .should('have.attr', 'data-selected', 'false')
        .click()
      cy.getTestId("tally-settings-oc-toggle")
        .should('have.attr', 'data-selected', 'false')
        .click()
      cy.getTestId("tally-settings-sc-toggle")
        .should('have.attr', 'data-selected', 'false')
        .click()
      cy.getTestId("tally-settings-sp-toggle")
        .should('have.attr', 'data-selected', 'false')
        .click()
      cy.getTestId("tally-settings-oi-toggle")
        .should('have.attr', 'data-selected', 'false')
        .click()
      // it should show the default value
      validateSliderValue("*[data-testid=tally-settings-ob]", 100)
      validateSliderValue("*[data-testid=tally-settings-sb]", 100)
      cy.getTestId("tally-settings-oc").should('have.attr', 'data-value', 'yellow-pink')
      cy.getTestId("tally-settings-sc").should('have.attr', 'data-value', 'default')
      cy.getTestId("tally-settings-sp").should('have.attr', 'data-value', 'true')
      cy.getTestId("tally-settings-oi").should('have.attr', 'data-value', 'true')

    }).then(() => {
      // when we save
      cy.getTestId(`tally-settings-submit`).click()

      // and reload
      cy.reload()
      cy.getTestId(`tally-${name}`).contains(name)
      cy.getTestId(`tally-${name}-menu`).click()
      cy.getTestId(`tally-${name}-settings`).click()

      // it should use the defaults
      cy.getTestId("tally-settings-ob-toggle").should('have.attr', 'data-selected', 'true')
      validateSliderValue("*[data-testid=tally-settings-ob]", 100)
      
      cy.getTestId("tally-settings-sb-toggle").should('have.attr', 'data-selected', 'true')
      validateSliderValue("*[data-testid=tally-settings-sb]", 100)

      cy.getTestId("tally-settings-oc-toggle").should('have.attr', 'data-selected', 'true')
      cy.getTestId("tally-settings-oc").should('have.attr', 'data-value', 'default')
      cy.getTestId("tally-settings-sp-toggle").should('have.attr', 'data-selected', 'true')
      cy.getTestId("tally-settings-sp").should('have.attr', 'data-value', 'true')
      cy.getTestId("tally-settings-oi-toggle").should('have.attr', 'data-selected', 'true')
      cy.getTestId("tally-settings-oi").should('have.attr', 'data-value', 'true')
    })
  })

  it('updates the UI if tally settings are changed', () => {
    const name = randomTallyName()
    cy.task('tally', name)
    const ourConfig = new TallyConfiguration()
    ourConfig.setOperatorLightBrightness(80)
    ourConfig.setStageLightBrightness(70)
    ourConfig.setOperatorColorScheme("default")
    ourConfig.setStageColorScheme("default")
    ourConfig.setStageShowsPreview(true)
    ourConfig.setOperatorShowsIdle(true)

    cy.getTestId(`tally-${name}`).contains(name).then(() => {
      socket.emit('tally.settings', name, "udp", ourConfig.toJson())
    })
    cy.getTestId(`tally-${name}-menu`).click()
    cy.getTestId(`tally-${name}-settings`).click()
    cy.getTestId(`tally-settings`)

    cy.getTestId("tally-settings-oc").should('have.attr', 'data-value', 'default')
    cy.getTestId("tally-settings-sc").should('have.attr', 'data-value', 'default')
    cy.getTestId("tally-settings-sp").should('have.attr', 'data-value', 'true')
    cy.getTestId("tally-settings-oi").should('have.attr', 'data-value', 'true')
    validateSliderValue("*[data-testid=tally-settings-ob]", 80)
    validateSliderValue("*[data-testid=tally-settings-sb]", 70).then(() => {
      // we change the settings from Hub without manual changes
      ourConfig.setOperatorLightBrightness(40)
      ourConfig.setStageLightBrightness(30)
      ourConfig.setOperatorColorScheme("yellow-pink")
      ourConfig.setStageColorScheme("yellow-pink")
      ourConfig.setStageShowsPreview(false)
      ourConfig.setOperatorShowsIdle(false)
      socket.emit('tally.settings', name, "udp", ourConfig.toJson())

      cy.getTestId("tally-settings-oc").should('have.attr', 'data-value', 'yellow-pink')
      cy.getTestId("tally-settings-sc").should('have.attr', 'data-value', 'yellow-pink')
      cy.getTestId("tally-settings-sp").should('have.attr', 'data-value', 'false')
      cy.getTestId("tally-settings-oi").should('have.attr', 'data-value', 'false')
      validateSliderValue("*[data-testid=tally-settings-ob]", 40)
      validateSliderValue("*[data-testid=tally-settings-sb]", 30)
    }).then(() => {
      // we change the values from UI, but not saving
      setSliderValue("*[data-testid=tally-settings-ob]", 99)
      setSliderValue("*[data-testid=tally-settings-sb]", 98)
      cy.getTestId("tally-settings-oc-yellow-pink").click()
      cy.getTestId("tally-settings-sc-default").click()
      cy.getTestId("tally-settings-sp").click()
      cy.getTestId("tally-settings-oi").click()

      cy.getTestId("tally-settings-oc").should('have.attr', 'data-value', 'yellow-pink')
      cy.getTestId("tally-settings-sc").should('have.attr', 'data-value', 'default')
      cy.getTestId("tally-settings-sp").should('have.attr', 'data-value', 'true')
      cy.getTestId("tally-settings-oi").should('have.attr', 'data-value', 'true')
      validateSliderValue("*[data-testid=tally-settings-ob]", 99)
      validateSliderValue("*[data-testid=tally-settings-sb]", 98)
    }).then(() => {
      // then changes from the server should override our changes
      ourConfig.setOperatorLightBrightness(50)
      ourConfig.setStageLightBrightness(25)
      ourConfig.setOperatorColorScheme("default")
      ourConfig.setStageColorScheme("yellow-pink")
      ourConfig.setStageShowsPreview(false)
      ourConfig.setOperatorShowsIdle(false)
      socket.emit('tally.settings', name, "udp", ourConfig.toJson())

      cy.getTestId("tally-settings-oc").should('have.attr', 'data-value', 'default')
      cy.getTestId("tally-settings-sc").should('have.attr', 'data-value', 'yellow-pink')
      cy.getTestId("tally-settings-sp").should('have.attr', 'data-value', 'false')
      cy.getTestId("tally-settings-oi").should('have.attr', 'data-value', 'false')
      validateSliderValue("*[data-testid=tally-settings-ob]", 50)
      validateSliderValue("*[data-testid=tally-settings-sb]", 25)
    })
  })

  it('updates the UI if default tally settings are changed', () => {
    const name = randomTallyName()
    cy.task('tally', name)
    const defaultConfig = new DefaultTallyConfiguration()

    cy.getTestId(`tally-${name}`).contains(name)
    cy.getTestId(`tally-${name}-menu`).click()
    cy.getTestId(`tally-${name}-settings`).click()
    cy.getTestId(`tally-settings`)

    // initial check that we use the default
    cy.getTestId("tally-settings-oc-toggle").should('have.attr', 'data-selected', 'true')
    cy.getTestId("tally-settings-oc").should('have.attr', 'data-value', 'default')
    cy.getTestId("tally-settings-sc-toggle").should('have.attr', 'data-selected', 'true')
    cy.getTestId("tally-settings-sc").should('have.attr', 'data-value', 'default')
    cy.getTestId("tally-settings-sp-toggle").should('have.attr', 'data-selected', 'true')
    cy.getTestId("tally-settings-sp").should('have.attr', 'data-value', 'true')
    cy.getTestId("tally-settings-oi-toggle").should('have.attr', 'data-selected', 'true')
    cy.getTestId("tally-settings-oi").should('have.attr', 'data-value', 'true')
    cy.getTestId("tally-settings-ob-toggle").should('have.attr', 'data-selected', 'true')
    validateSliderValue("*[data-testid=tally-settings-ob]", 100)
    cy.getTestId("tally-settings-sb-toggle").should('have.attr', 'data-selected', 'true')
    validateSliderValue("*[data-testid=tally-settings-sb]", 100).then(() => {
      defaultConfig.setOperatorLightBrightness(70)
      defaultConfig.setStageLightBrightness(66)
      defaultConfig.setOperatorColorScheme("yellow-pink")
      defaultConfig.setStageColorScheme("yellow-pink")
      defaultConfig.setStageShowsPreview(false)
      defaultConfig.setOperatorShowsIdle(false)
      socket.emit('config.change.tallyconfig', defaultConfig.toJson())
      validateSliderValue("*[data-testid=tally-settings-ob]", 70)
      validateSliderValue("*[data-testid=tally-settings-sb]", 66)
      cy.getTestId("tally-settings-oc").should('have.attr', 'data-value', 'yellow-pink')
      cy.getTestId("tally-settings-sc").should('have.attr', 'data-value', 'yellow-pink')
      cy.getTestId("tally-settings-sp").should('have.attr', 'data-value', 'false')
      cy.getTestId("tally-settings-oi").should('have.attr', 'data-value', 'false')
    })
  })

  context("correctly implements settings into udp commands", () => {

    let name = randomTallyName()

    beforeEach(() => {
      name = randomTallyName()
      cy.task('tally', name)
      
      cy.getTestId(`tally-${name}`).contains(name).then(() => {
        socket.emit('config.change.tallyconfig', (new DefaultTallyConfiguration()).toJson())
        socket.emit('tally.patch', name, "udp", "1")
        cy.task("mixerProgPrev", {programs: ["1"], previews: ["2"]})
      })
      cy.getTestId(`tally-${name}-menu`).click()
      cy.getTestId(`tally-${name}-settings`).click()
  
      cy.getTestId(`tally-settings`)
    })

    it("works with the default", () => {
      cy.task('tallyLastCommand', name).then((lastCommand) => {
        expect(lastCommand).to.eq("O255/000/000 S255/000/000")
      }).then(() => {
        cy.task("mixerProgPrev", {programs: ["2"], previews: ["1"]})
        cy.task('tallyLastCommand', name).then((lastCommand) => {
          expect(lastCommand).to.eq("O000/255/000 S000/255/000")
        })
      })
    })

    it("operator brightness", () => {
      cy.getTestId("tally-settings-ob-toggle")
        .should('have.attr', 'data-selected', 'true')
        .click()
      setSliderValue("*[data-testid=tally-settings-ob]", 50)
      cy.getTestId(`tally-settings-submit`).click()

      cy.task('tallyLastCommand', name).then((lastCommand) => {
        expect(lastCommand).to.eq("O128/000/000 S255/000/000")
      }).then(() => {
        cy.task("mixerProgPrev", {programs: ["2"], previews: ["1"]})
        cy.task('tallyLastCommand', name).then((lastCommand) => {
          expect(lastCommand).to.eq("O000/128/000 S000/255/000")
        })
      })
    })

    it("operator color scheme", () => {
      cy.getTestId("tally-settings-oc-toggle")
        .should('have.attr', 'data-selected', 'true')
        .click()
      cy.getTestId("tally-settings-oc-yellow-pink").click()
      cy.getTestId(`tally-settings-submit`).click()

      cy.task('tallyLastCommand', name).then((lastCommand) => {
        expect(lastCommand).to.eq("O255/255/000 S255/000/000")
      }).then(() => {
        cy.task("mixerProgPrev", {programs: ["2"], previews: ["1"]})
        cy.task('tallyLastCommand', name).then((lastCommand) => {
          expect(lastCommand).to.eq("O255/000/255 S000/255/000")
        })
      })
    })

    it("stage brightness", () => {
      cy.getTestId("tally-settings-sb-toggle")
        .should('have.attr', 'data-selected', 'true')
        .click()
      setSliderValue("*[data-testid=tally-settings-sb]", 50)
      cy.getTestId(`tally-settings-submit`).click()

      cy.task('tallyLastCommand', name).then((lastCommand) => {
        expect(lastCommand).to.eq("O255/000/000 S128/000/000")
      }).then(() => {
        cy.task("mixerProgPrev", {programs: ["2"], previews: ["1"]})
        cy.task('tallyLastCommand', name).then((lastCommand) => {
          expect(lastCommand).to.eq("O000/255/000 S000/128/000")
        })
      })
    })

    it("stage color scheme", () => {
      cy.getTestId("tally-settings-sc-toggle")
        .should('have.attr', 'data-selected', 'true')
        .click()
      cy.getTestId("tally-settings-sc-yellow-pink").click()
      cy.getTestId(`tally-settings-submit`).click()

      cy.task('tallyLastCommand', name).then((lastCommand) => {
        expect(lastCommand).to.eq("O255/000/000 S255/255/000")
      }).then(() => {
        cy.task("mixerProgPrev", {programs: ["2"], previews: ["1"]})
        cy.task('tallyLastCommand', name).then((lastCommand) => {
          expect(lastCommand).to.eq("O000/255/000 S255/000/255")
        })
      })
    })

    it("stage preview", () => {
      cy.getTestId("tally-settings-sp-toggle")
        .should('have.attr', 'data-selected', 'true')
        .click()
      cy.getTestId("tally-settings-sp").click()
      cy.getTestId(`tally-settings-submit`).click()

      cy.task('tallyLastCommand', name).then((lastCommand) => {
        expect(lastCommand).to.eq("O255/000/000 S255/000/000")
      }).then(() => {
        cy.task("mixerProgPrev", {programs: ["2"], previews: ["1"]})
        cy.task('tallyLastCommand', name).then((lastCommand) => {
          expect(lastCommand).to.eq("O000/255/000 S000/000/000")
        })
      })
    })

    it("operator idle", () => {
      cy.getTestId("tally-settings-oi-toggle")
        .should('have.attr', 'data-selected', 'true')
        .click()
      cy.getTestId("tally-settings-oi").click()
      cy.getTestId(`tally-settings-submit`).click()

      cy.task('tallyLastCommand', name).then((lastCommand) => {
        expect(lastCommand).to.eq("O255/000/000 S255/000/000")
      }).then(() => {
        cy.task("mixerProgPrev", {programs: [], previews: []})
        cy.task('tallyLastCommand', name).then((lastCommand) => {
          expect(lastCommand).to.eq("O000/000/000 S000/000/000")
        })
      })
    })
  })

  it.skip('it persists the settings through restart')
})