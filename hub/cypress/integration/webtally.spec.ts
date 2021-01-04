/// <reference types="Cypress" />

import { socket } from '../../src/hooks/useSocket'
import TestConfiguration from '../../src/mixer/test/TestConfiguration'
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
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'unpatched').then(() => {
      cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] select`).select("Channel 1")
      cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] select`).should('have.value', "1")
    })
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
    cy.get(`*[data-testid=tally-${name}]`).should('not.have.attr', 'data-color', 'unpatched')
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

  it("Web Tallies are linked", () => {
    const name = registerRandomTallyName()
    socket.emit('tally.create', name)

    cy.get(`*[data-testid=tally-${name}]`).contains(name)
    cy.get(`*[data-testid=tally-${name}-menu]`).click()
    cy.get(`*[data-testid=tally-${name}-web]`).click()

    cy.get(`*[data-testid=page-tally-web]`)
    cy.get(`*[data-testid=page-tally-web]`).contains(name)
  })

  it("Web Tallies can be deep linked", () => {
    const name = registerRandomTallyName()
    socket.emit('tally.create', name)

    cy.visit(`/tally/web-${name}`)
    cy.get(`*[data-testid=page-tally-web]`)
    cy.get(`*[data-testid=page-tally-web]`).contains(name)
  })

  it("Udp Tallies can not be used as web tallies", () => {
    const name = randomTallyName()
    cy.task('tally', name)

    cy.get(`*[data-testid=tally-${name}]`).contains(name)
    cy.get(`*[data-testid=tally-${name}-menu]`).click()
    cy.get(`*[data-testid=tally-${name}-web]`).should('not.exist')

    cy.visit(`/tally/udp-${name}`)
    cy.get(`*[data-testid=page-404]`)
  })

  it("shows the correct connection status", () => {
    const name = registerRandomTallyName()
    socket.emit('tally.create', name)

    cy.get(`*[data-testid=tally-${name}]`).contains(name)
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'false').then(() => {
      socket.emit('events.webTally.subscribe', name)
      cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'true').then(() => {
        socket.emit('events.webTally.unsubscribe', name)
        cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'false')
      })
    })
  })

  it("shows changes in the mixer", () => {
    const setMixer = (programs, previews) => {
      const config = new TestConfiguration()
      config.setPrograms(programs)
      config.setPreviews(previews)
      socket.emit("config.change.test", config, "test")
    }

    const name = registerRandomTallyName()
    socket.emit('tally.create', name)
    socket.emit('tally.patch', name, "web", "1")
    cy.visit(`/tally/web-${name}`)
    cy.get(`*[data-testid=page-tally-web]`)

    // program
    setMixer(["1"], ["2"])
    cy.get(`*[data-testid=page-tally-web]`).should('have.attr', 'data-color', 'program').then(() => {
      // preview
      setMixer(["2"], ["1"])
      cy.get(`*[data-testid=page-tally-web]`).should('have.attr', 'data-color', 'preview').then(() => {
        // idle
        setMixer(["2"], ["3"])
        cy.get(`*[data-testid=page-tally-web]`).should('have.attr', 'data-color', 'idle')
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
    cy.get(`*[data-testid=page-tally-web]`)

    cy.get(`*[data-testid=page-tally-web]`).should('have.attr', 'data-color', 'program').then(() => {
      socket.emit('tally.patch', name, "web", "2")
      cy.get(`*[data-testid=page-tally-web]`).should('have.attr', 'data-color', 'preview').then(() => {
        socket.emit('tally.patch', name, "web", "3")
        cy.get(`*[data-testid=page-tally-web]`).should('have.attr', 'data-color', 'idle')
      })
    })
  })

  it("shows highlight", () => {
    const name = registerRandomTallyName()
    socket.emit('tally.create', name)
    socket.emit('tally.patch', name, "web", "1")
    cy.visit(`/tally/web-${name}`)
    cy.get(`*[data-testid=page-tally-web]`).then(() => {
      socket.emit('tally.highlight', name, "web")
      cy.get(`*[data-testid=page-tally-web]`).should('have.attr', 'data-color', 'highlight')
    })
  })

  it("shows if mixer is disconnected", () => {
    const name = registerRandomTallyName()
    socket.emit('tally.create', name)
    socket.emit('tally.patch', name, "web", "1")
    socket.emit('config.change.null', "null")
    cy.visit(`/tally/web-${name}`)
    cy.get(`*[data-testid=page-tally-web]`)

    socket.emit('tally.highlight', name, "web")
    cy.get(`*[data-testid=page-tally-web]`).should('have.attr', 'data-color', 'unknown')
  })

  it.skip("reconnects when its connection is cut")
  it.skip("indicates when connection to server is broken")
  it.skip("prevents screen lock on mobile devices when going into full screen")
  it.skip('updates a tally when defaults are changed')
})
