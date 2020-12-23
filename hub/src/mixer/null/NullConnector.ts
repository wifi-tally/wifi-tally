// a connector that does not do anything

import { MixerCommunicator } from "../../lib/MixerCommunicator"
import { Connector } from "../interfaces"
import NullConfiguration from "./NullConfiguration"

class NullConnector implements Connector {
    communicator: MixerCommunicator
    constructor(_: NullConfiguration, communicator: MixerCommunicator) {
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
    static readonly ID: "null" = "null"
}

export default NullConnector
