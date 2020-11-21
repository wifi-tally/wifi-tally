// a connector that does not do anything

import { MixerCommunicator } from "../../lib/MixerCommunicator"
import { Connector } from "../interfaces"

class NullConnector implements Connector {
    communicator: MixerCommunicator
    constructor(communicator: MixerCommunicator) {
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
    static ID = "null"
}

export default NullConnector
