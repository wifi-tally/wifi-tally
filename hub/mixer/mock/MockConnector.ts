// a mock connector that generates random programs and previews

import { MixerCommunicator } from "../../lib/MixerCommunicator"
import { Connector } from "../interfaces"
import MockConfiguration from "./MockConfiguration"

class MockConnector implements Connector {
    configuration: MockConfiguration
    communicator: MixerCommunicator
    isActive: boolean
    intervalHandle?: NodeJS.Timeout

    constructor(configuration: MockConfiguration, communicator: MixerCommunicator) {
        this.configuration = configuration
        this.communicator = communicator
        this.isActive = false
    }
    connect() {
        console.log(`Simulating a mock video mixer with ${this.configuration.getChannelCount()} channels that changes programs every ${this.configuration.getTickTime()}ms`)
        this.isActive = true
        this.communicator.notifyMixerIsConnected()
        this.communicator.notifyChannels(this.configuration.getChannels())

        const fn = () => {
            const mockCurrentPrograms = [Math.floor(Math.random() * (this.configuration.getChannelCount() + 1)).toString()]
            const mockCurrentPreviews = [Math.floor(Math.random() * (this.configuration.getChannelCount() + 1)).toString()]
            this.communicator.notifyProgramPreviewChanged(mockCurrentPrograms, mockCurrentPreviews)
        }
        this.intervalHandle = setInterval(fn, this.configuration.getTickTime())
        fn()
    }
    disconnect() {
        console.log("Stopping mock video mixer")
        this.isActive = false
        this.communicator.notifyMixerIsDisconnected()
        if(this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = undefined;
        }
    }
    isConnected() {
        return this.isActive
    }

    static ID = "mock"
}

export default MockConnector
