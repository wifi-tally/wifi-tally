// a connector that does not do anything

class NullConnector {
    constructor(emitter) {
        this.emitter = emitter
    }
    connect() {
        console.log("No video mixer connected.")
        this.emitter.emit("program.changed", null, null)
    }
    disconnect() {}

    isConnected() {
        // it is never supposed to be connected
        return false
    }
}

NullConnector.ID = "null"

module.exports = NullConnector;