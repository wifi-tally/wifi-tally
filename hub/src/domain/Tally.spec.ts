import Tally, { ConnectionState, UdpTally, WebTally } from './Tally'

test('Udp Tally defaults', () => {
    const tally = new UdpTally("Test Dummy")

    expect(tally.isPatched()).toEqual(false)
    expect(tally.isActive()).toEqual(false)
    expect(tally.isConnected()).toEqual(false)
    expect(tally.isDisconnected()).toEqual(true)
    expect(tally.isHighlighted()).toEqual(false)
    expect(tally.isMissing()).toEqual(false)
})

describe('toJsonForSave/fromJsonForSave', () => {
    test('it loads an UdpTally by default', () => {
        // old configuration to not have a "type"
    
        const tally = Tally.fromJsonForSave({
            name: "Foobar",
            channelId: "42",
        })
    
        expect(tally.type).toEqual("udp")
    })
    test('can save and load UdpTally', () => {
        const tally = new UdpTally("Udp", "123")
        const json = tally.toJsonForSave()

        const loadedTally = Tally.fromJsonForSave(json) as UdpTally

        expect(loadedTally.name).toEqual("Udp")
        expect(loadedTally.channelId).toEqual("123")
        expect(loadedTally.type).toEqual("udp")
    })
    test('can save and load WebTally', () => {
        const tally = new WebTally("Web", "123")
        const json = tally.toJsonForSave()

        const loadedTally = Tally.fromJsonForSave(json) as WebTally

        expect(loadedTally.name).toEqual("Web")
        expect(loadedTally.channelId).toEqual("123")
        expect(loadedTally.type).toEqual("web")
    })
})

describe('toJson/fromJson', () => {
    test('it can serialize an UdpTally', () => {
        const udpTally = new UdpTally("Udp Tally", "123", "1.2.3.4", 1234, ConnectionState.CONNECTED)
    
        const json = udpTally.toJson()
        const tally = Tally.fromJson(json) as UdpTally
    
        expect(tally.type).toEqual("udp")
        expect(tally.name).toEqual("Udp Tally")
        expect(tally.channelId).toEqual("123")
        expect(tally.address).toEqual("1.2.3.4")
        expect(tally.port).toEqual(1234)
        expect(tally.state).toEqual(ConnectionState.CONNECTED)
    })
    
    test('it can save and load a WebTally', () => {
        const webTally = new WebTally("Web Tally", "123", [{address: "1.2.3.4"}])
    
        const json = webTally.toJson()
        const tally = Tally.fromJson(json) as WebTally
    
        expect(tally.type).toEqual("web")
        expect(tally.name).toEqual("Web Tally")
        expect(tally.channelId).toEqual("123")
        expect(tally.connectedClients[0].address).toEqual("1.2.3.4")
    })
})
