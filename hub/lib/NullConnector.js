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
}

NullConnector.ID = "null"

module.exports = NullConnector;