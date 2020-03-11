class Tally {
    constructor(name, channelId = -1, address = null, port = null, state = Tally.DISCONNECTED) {
        this.name = name
        this.channelId = channelId
        this.address = address
        this.port = port
        this.state = state
        this.highlight = false
    }
    isPatched() {
        return this.channelId >= 0
    }
    isConnected() {
        return this.address !== null && this.port !== null && this.state != Tally.DISCONNECTED
    }
    setHighlight(highlight) {
        this.highlight = highlight
    }
    isHighlighted() {
        return this.highlight
    }
    toValueObject() {
        return {
            name: this.name,
            channelId: this.channelId,
            address: this.address,
            port: this.port,
            state: this.state,
        }
    }
    isIn(channels = []) {
        return channels.indexOf(this.channelId) != -1
    }
}

Tally.fromValueObject = function(valueObject) {
    const tally = new Tally(
        valueObject.name,
        valueObject.channelId,
    )
    return tally
}

Tally.DISCONNECTED = 0
Tally.CONNECTED = 1
Tally.MISSING = 2

module.exports = Tally;