// a connector that does not do anything

class NullConnector {
    constructor(communicator) {
        this.communicator = communicator
    }
    connect() {
        console.log("No video mixer connected.")
        this.communicator.notifyProgramPreviewChanged(null, null)
    }
    disconnect() {}

    isConnected() {
        // it is never supposed to be connected
        return false
    }
}

NullConnector.ID = "null"

module.exports = NullConnector;