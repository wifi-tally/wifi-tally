import Tally from './Tally'

test('defaults', () => {
    const tally = new Tally("Test Dummy")

    expect(tally.isPatched()).toEqual(false)
    expect(tally.isActive()).toEqual(false)
    expect(tally.isConnected()).toEqual(false)
    expect(tally.isDisconnected()).toEqual(true)
    expect(tally.isHighlighted()).toEqual(false)
    expect(tally.isMissing()).toEqual(false)
})
