/// <reference types="Cypress" />

import randomTallyName from '../browserlib/randomTallyName'
import TestConfiguration from '../../src/mixer/test/TestConfiguration'
import { socket } from '../../src/hooks/useSocket'

describe('Tally display', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get("*[data-testid=page-index]")
  })
  afterEach(() => {
    cy.task('tallyCleanup')
  })

  it('should count connected tallies', () => {
    const name = randomTallyName()
    cy.task('tally', name).then(() => {
      cy.get(`*[data-testid=tally-${name}]`).contains(name)
      cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'true')
      cy.get("*[data-testid=tallies-connected").contains("1")
    })
    
    const name2 = randomTallyName()
    cy.task('tally', name2).then(() => {
      cy.get(`*[data-testid=tally-${name2}]`).contains(name2)
      cy.get("*[data-testid=tallies-connected").contains("2")
    })

    const name3 = randomTallyName()
    cy.task('tally', name3).then(() => {
      cy.get(`*[data-testid=tally-${name3}]`).contains(name3)
      cy.get("*[data-testid=tallies-connected").contains("3")
    })

    // a tally disconnects
    cy.task('tallyDisconnect', name3).then(() => {
      cy.get(`*[data-testid=tally-${name3}]`).contains(name3)
      cy.get(`*[data-testid=tally-${name3}]`).contains("missing", {matchCase: false})
      cy.get("*[data-testid=tallies-connected").contains("2")

      cy.get(`*[data-testid=tally-${name3}]`).should('have.attr', 'data-isactive', 'false')
      cy.get("*[data-testid=tallies-connected").contains("2")
    })

    // a tally is removed
    cy.task('tallyKill', name2).then(() => {
      cy.get("*[data-testid=tallies-connected").contains("1")
    })
  })

  it('allows to patch / unpatch a tally', () => {
    const name = randomTallyName()
    cy.task('tally', name)
    const config = new TestConfiguration()
    config.setPrograms(["1"])
    config.setPreviews(["2"])
    socket.emit("config.change.test", config, "test")
  
    cy.get(`*[data-testid=tally-${name}]`).contains(name)
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'unpatched')
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'true')

    cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] select`).select("Channel 1")
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'program')
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'true')
    cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] :selected`).contains("Channel 1")

    cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] select`).select("(unpatched)")
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'unpatched')
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'true')
    cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] :selected`).contains("(unpatched)")
  })
  
  it('updates the interface when a tally is patched/unpatched from a different browser', () => {
    const name = randomTallyName()
    cy.task('tally', name).then(() => {
      const config = new TestConfiguration()
      config.setPrograms(["1"])
      config.setPreviews(["2"])
      socket.emit("config.change.test", config, "test")
    
      cy.get(`*[data-testid=tally-${name}]`).contains(name)
      cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'unpatched')
      cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'true').then(() => {
        socket.emit('tally.patch', name, "udp", "1")
        cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'program')
        cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'true')
        cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] :selected`).contains("Channel 1").then(() => {
          socket.emit('tally.patch', name, "udp", null)
          cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'unpatched')
          cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'true')
          cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] :selected`).contains("(unpatched)")
        })
      })
    })
  })


  it('allows to patch / unpatch a disconnected tally', () => {
    const name = randomTallyName()
    cy.task('tally', name)
    const config = new TestConfiguration()
    config.setPrograms(["1"])
    config.setPreviews(["2"])
    socket.emit("config.change.test", config, "test")
  
    cy.get(`*[data-testid=tally-${name}]`).contains(name).then(() => {
      cy.task('tallyDisconnect', name)
    })
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'unpatched')
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'false')

    cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] select`).select("Channel 1")
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'program')
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'false')
    cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] :selected`).contains("Channel 1")

    cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] select`).select("(unpatched)")
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'unpatched')
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'false')
    cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] :selected`).contains("(unpatched)")
  })
  
  it('updates the interface when a disconnected tally is patched/unpatched from a different browser', () => {
    const name = randomTallyName()
    cy.task('tally', name).then(() => {
      const config = new TestConfiguration()
      config.setPrograms(["1"])
      config.setPreviews(["2"])
      socket.emit("config.change.test", config, "test")
    
      cy.get(`*[data-testid=tally-${name}]`).contains(name).then(() => {
        cy.task('tallyDisconnect', name)
      })
      cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'unpatched')
      cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'false').then(() => {
        socket.emit('tally.patch', name, "udp", "1")
        cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'program')
        cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'false')
        cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] :selected`).contains("Channel 1").then(() => {
          socket.emit('tally.patch', name, "udp", null)
          cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'unpatched')
          cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-isactive', 'false')
          cy.get(`*[data-testid=tally-${name}] *[data-testid=channel-selector] :selected`).contains("(unpatched)")
        })
      })
    })
  })

  it('tally display changes with the mixer', () => {
    const setMixer = (programs, previews) => {
      const config = new TestConfiguration()
      config.setPrograms(programs)
      config.setPreviews(previews)
      socket.emit("config.change.test", config, "test")
    }

    const name = randomTallyName()
    cy.task('tally', name)
    cy.get(`*[data-testid=tally-${name}]`).contains(name).then(() => {
      socket.emit('tally.patch', name, "udp", "1")
    })

    // program
    setMixer(["1"], ["2"])
    cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'program').then(() => {
      // preview
      setMixer(["2"], ["1"])
      cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'preview').then(() => {
        // idle
        setMixer(["2"], ["3"])
        cy.get(`*[data-testid=tally-${name}]`).should('have.attr', 'data-color', 'idle')
      })
    })
  })

  it.skip('can highlight a tally')
  it.skip('can remove a tally')
  it.skip('can handle web tally and udp tally with the same name')
  it.skip('shows a channel even when it is not available anymore')

})