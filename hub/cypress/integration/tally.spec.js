import randomTallyName from '../browserlib/randomTallyName'

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
      cy.get(`*[data-testid=tally-${name}]`).contains("connected", {matchCase: false})
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

      cy.get(`*[data-testid=tally-${name3}]`).contains("disconnected", {matchCase: false})
      cy.get("*[data-testid=tallies-connected").contains("2")
    })

    // a tally is removed
    cy.task('tallyKill', name2).then(() => {
      cy.get("*[data-testid=tallies-connected").contains("1")
    })
  })
})