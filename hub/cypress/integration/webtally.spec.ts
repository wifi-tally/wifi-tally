/// <reference types="Cypress" />
/// <reference types="../support" />

import { socket } from '../../src/hooks/useSocket'
import TestConfiguration from '../../src/mixer/test/TestConfiguration'
import { DefaultTallyConfiguration, TallyConfiguration } from '../../src/tally/TallyConfiguration'
import randomTallyName from '../browserlib/randomTallyName'

describe('Web Tally Creation', () => {

  let createdTallies = []
  const registerRandomTallyName = () => {
    const name = randomTallyName()
    createdTallies.push(name)
    return name
  }

  const setMixer = (programs, previews) => {
    const config = new TestConfiguration()
    config.setPrograms(programs)
    config.setPreviews(previews)
    socket.emit("config.change.test", config, "test")
  }

  beforeEach(() => {
    cy.visit('/')
    cy.getTestId("page-index")
    createdTallies = []
  })
  afterEach(() => {
    cy.task('tallyCleanup')
    createdTallies.forEach(name => cy.task('tallyKill', name))
    createdTallies = []
  })

  it('can create an unpatched web tally', () => {
    const name = registerRandomTallyName()
    cy.getTestId("tally-create").click()
    cy.getTestId("tally-create-popup")
    cy.getTestId("tally-create-name").type('{selectall}' + name)
    cy.getTestId("tally-create-ok").click()

    // pop up should close
    cy.getTestId("tally-create-popup").should('not.exist')
    cy.getTestId(`tally-${name}`).contains(name)
    cy.getTestId(`tally-${name}`).should('have.attr', 'data-color', 'unpatched').then(() => {
      cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] select`).select("Channel 1")
      cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] select`).should('have.value', "1")
    })
  })
  it('can create a patched web tally', () => {
    const name = registerRandomTallyName()
    cy.getTestId("tally-create").click()
    cy.getTestId("tally-create-popup")
    cy.getTestId("tally-create-name").type('{selectall}' + name)
    cy.get(`*[data-testid=tally-create-popup] *[data-testid=channel-selector] select`).select("Channel 1")
    cy.getTestId("tally-create-ok").click()

    // pop up should close
    cy.getTestId("tally-create-popup").should('not.exist')
    cy.getTestId(`tally-${name}`).contains(name)
    cy.getTestId(`tally-${name}`).should('not.have.attr', 'data-color', 'unpatched')
    cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] :selected`).contains("Channel 1")
  })

  it('only shows the warning when no UDP tallies are configured', () => {
    // it should be shown if no UDP tally exists
    cy.getTestId("tally-create").click()
    cy.getTestId("tally-create-popup")
    cy.getTestId("tally-create-warning").should('exist')
    cy.getTestId("tally-create-cancel").click()
    cy.getTestId("tally-create-popup").should('not.exist')

    // it should not be shown if UDP tallies exist
    const udpName = randomTallyName()
    cy.task('tally', udpName)
    cy.getTestId("tally-create").click()
    cy.getTestId("tally-create-warning").should('not.exist')
  })

  it('can not create tallies with invalid names', () => {
    const udpName = randomTallyName()
    cy.task('tally', udpName)

    cy.getTestId("tally-create").click()
    // disabled because empty
    cy.getTestId("tally-create-name").type('{selectall}{del}')
    cy.getTestId("tally-create-ok").should('be.disabled')

    // allowed because ok name
    cy.getTestId("tally-create-name").type('{selectall}' + randomTallyName())
    cy.getTestId("tally-create-ok").should('not.be.disabled')

    // disabled because too long
    cy.getTestId("tally-create-name").type('123456788901234567890')
    cy.getTestId("tally-create-ok").should('be.disabled')

    // disabled because already existant name
    cy.getTestId("tally-create-name").type('{selectall}' + udpName)
    cy.getTestId("tally-create-ok").should('be.disabled')

    // ok, because does not match an existant name
    cy.getTestId("tally-create-name").type('{backspace}')
    cy.getTestId("tally-create-ok").should('not.be.disabled')
  })

  it('Udp Tally and Web Tally with same name can co-exist', () => {
    const name = randomTallyName()
    cy.task('tally', name)
    socket.emit('tally.create', name)

    cy.getTestId(`tally-${name}`).should('have.length', 2)
  })

  it("Web Tallies are linked", () => {
    const name = registerRandomTallyName()
    socket.emit('tally.create', name)

    cy.getTestId(`tally-${name}`).contains(name)
    cy.getTestId(`tally-${name}-menu`).click()
    cy.getTestId(`tally-${name}-web`).click()

    cy.getTestId(`page-tally-web`)
    cy.getTestId(`page-tally-web`).contains(name)
  })

  it("Web Tallies can be deep linked", () => {
    const name = registerRandomTallyName()
    socket.emit('tally.create', name)

    cy.visit(`/tally/web-${name}`)
    cy.getTestId(`page-tally-web`)
    cy.getTestId(`page-tally-web`).contains(name)
  })

  it("Udp Tallies can not be used as web tallies", () => {
    const name = randomTallyName()
    cy.task('tally', name)

    cy.getTestId(`tally-${name}`).contains(name)
    cy.getTestId(`tally-${name}-menu`).click()
    cy.getTestId(`tally-${name}-web`).should('not.exist')

    cy.visit(`/tally/udp-${name}`)
    cy.getTestId(`page-404`)
  })

  it("shows the correct connection status", () => {
    const name = registerRandomTallyName()
    socket.emit('tally.create', name)

    cy.getTestId(`tally-${name}`).contains(name)
    cy.getTestId(`tally-${name}`).should('have.attr', 'data-isactive', 'false').then(() => {
      socket.emit('events.webTally.subscribe', name)
      cy.getTestId(`tally-${name}`).should('have.attr', 'data-isactive', 'true').then(() => {
        socket.emit('events.webTally.unsubscribe', name)
        cy.getTestId(`tally-${name}`).should('have.attr', 'data-isactive', 'false')
      })
    })
  })

  it("shows changes in the mixer", () => {
    const name = registerRandomTallyName()
    socket.emit('tally.create', name)
    socket.emit('tally.patch', name, "web", "1")
    cy.visit(`/tally/web-${name}`)
    cy.getTestId(`page-tally-web`)

    // program
    setMixer(["1"], ["2"])
    cy.getTestId(`page-tally-web`).should('have.attr', 'data-color', 'program').then(() => {
      // preview
      setMixer(["2"], ["1"])
      cy.getTestId(`page-tally-web`).should('have.attr', 'data-color', 'preview').then(() => {
        // idle
        setMixer(["2"], ["3"])
        cy.getTestId(`page-tally-web`).should('have.attr', 'data-color', 'idle')
      })
    })
  })

  it("shows changes when it is patched", () => {
    const config = new TestConfiguration()
    config.setPrograms(["1"])
    config.setPreviews(["2"])
    socket.emit("config.change.test", config, "test")

    const name = registerRandomTallyName()
    socket.emit('tally.create', name)
    socket.emit('tally.patch', name, "web", "1")
    cy.visit(`/tally/web-${name}`)
    cy.getTestId(`page-tally-web`)

    cy.getTestId(`page-tally-web`).should('have.attr', 'data-color', 'program').then(() => {
      socket.emit('tally.patch', name, "web", "2")
      cy.getTestId(`page-tally-web`).should('have.attr', 'data-color', 'preview').then(() => {
        socket.emit('tally.patch', name, "web", "3")
        cy.getTestId(`page-tally-web`).should('have.attr', 'data-color', 'idle')
      })
    })
  })

  it("shows highlight", () => {
    const name = registerRandomTallyName()
    socket.emit('tally.create', name)
    socket.emit('tally.patch', name, "web", "1")
    cy.visit(`/tally/web-${name}`)
    cy.getTestId(`page-tally-web`).then(() => {
      socket.emit('tally.highlight', name, "web")
      cy.getTestId(`page-tally-web`).should('have.attr', 'data-color', 'highlight')
    })
  })

  it("shows if mixer is disconnected", () => {
    const name = registerRandomTallyName()
    socket.emit('tally.create', name)
    socket.emit('tally.patch', name, "web", "1")
    socket.emit('config.change.null', "null")
    cy.visit(`/tally/web-${name}`)
    cy.getTestId(`page-tally-web`)

    socket.emit('tally.highlight', name, "web")
    cy.getTestId(`page-tally-web`).should('have.attr', 'data-color', 'unknown')
  })

  it("allows to configure a brightness", () => {
    const name = registerRandomTallyName()
    socket.emit('tally.create', name)

    cy.visit(`/tally/web-${name}`)
    cy.getTestId(`page-tally-web`).then(() => {
      socket.emit('tally.settings', name, "web", (new TallyConfiguration()).toJson())
      // it should have full brightness by default
      cy.getTestId("page-tally-web").should('have.attr', 'data-brightness', '1')
    }).then(() => {
      cy.getTestId("tally-settings-link").click()
      cy.getTestId("tally-settings").should('exist')
      cy.getTestId("tally-settings-ob").should('exist')
      cy.getTestId("tally-settings-sb").should('not.exist')
      cy.getTestId("tally-settings-oc").should('exist')
      cy.getTestId("tally-settings-sc").should('not.exist')

      // we test the form in tally-settings.spec. No need to do it here again
    })
  })

  it("uses the operator brightness", () => {
    socket.emit('config.change.tallyconfig', (new DefaultTallyConfiguration()).toJson())
    const name = registerRandomTallyName()
    socket.emit('tally.create', name)

    cy.visit(`/tally/web-${name}`)
    cy.getTestId(`page-tally-web`).then(() => {
      // it should have full brightness by default
      cy.getTestId("page-tally-web").should('have.attr', 'data-brightness', '1')
    }).then(() => {
      const config = new DefaultTallyConfiguration()
      config.setOperatorLightBrightness(75)
      socket.emit('config.change.tallyconfig', config.toJson())

      cy.getTestId("page-tally-web").should('have.attr', 'data-brightness', '0.75')
    }).then(() => {
      const config = new TallyConfiguration()
      config.setOperatorLightBrightness(25)
      socket.emit('tally.settings', name, "web", config.toJson())

      cy.getTestId("page-tally-web").should('have.attr', 'data-brightness', '0.25')
    })
  })

  it.skip("should not reset settings when mixer state changes", () => {
    // this was a bug at one point
    const name = registerRandomTallyName()
    socket.emit('tally.create', name, "1")

    cy.visit(`/tally/web-${name}`)
    cy.getTestId(`page-tally-web`).then(() => {
      socket.emit('tally.settings', name, "web", (new TallyConfiguration()).toJson())
      setMixer(["1"], ["2"])
    }).then(() => {
      cy.getTestId("tally-settings-link").click()
      cy.getTestId("tally-settings").should('exist')

      cy.getTestId("tally-settings-ob-toggle")
        .should('have.attr', 'data-selected', 'true')
      cy.getTestId("tally-settings-ob-toggle")
        .click()
    }).then(() => {
      setMixer(["2"], ["1"])
      
      // waiting here is appropriate here. We need to make sure that the state has not
      // changed even after some time.
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500).then(() => {
        cy.getTestId("tally-settings-ob-toggle")
        .should('have.attr', 'data-selected', 'false')
      })
    })
  })

  it.skip("uses the operator color scheme")
  it.skip("reconnects when its connection is cut")
  it.skip("indicates when connection to server is broken")
  it.skip("prevents screen lock on mobile devices when going into full screen")
  it.skip('updates a tally when defaults are changed')
})
