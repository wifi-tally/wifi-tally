import { MixerCommunicator } from "../../lib/MixerCommunicator"
import { Connector } from "../interfaces"
import TestConfiguration from "./TestConfiguration"

class TestConnector implements Connector {
    communicator: MixerCommunicator
    configuration: TestConfiguration
    connected: boolean = false

    constructor(configuration: TestConfiguration, communicator: MixerCommunicator) {
        this.communicator = communicator
        this.configuration = configuration
    }
    connect() {
        console.log("starting mock server")
        this.connected = true
        this.communicator.notifyChannelNames(4)
        this.communicator.notifyProgramPreviewChanged(this.configuration.getPrograms(), this.configuration.getPreviews())
    }
    disconnect() {
        this.connected = false
    }

    isConnected() {
        return this.connected
    }
    static readonly ID: "test" = "test"
}

export default TestConnector
