// a mock connector that generates random programs and previews

class MockConnector {
    constructor(tickTime, channelCount, channelNames, communicator) {
        this.communicator = communicator
        this.tickTime = tickTime
        this.channelCount = channelCount
        this.channelNames = channelNames
        this.isActive = false
    }
    connect() {
        console.log(`Simulating a mock video mixer with ${this.channelCount} channels that changes programs every ${this.tickTime}ms`)
        this.isActive = true
        this.communicator.notifyMixerIsConnected()
        this.communicator.notifyChannelNames(this.channelCount, this.channelNames.split(",").map(name => name.trim()).reduce((map, name, idx) => {
            map[idx + 1] = name
            return map
        }, new Map()))

        const fn = () => {
            const mockCurrentPrograms = [Math.floor(Math.random() * (this.channelCount + 1))]
            const mockCurrentPreviews = [Math.floor(Math.random() * (this.channelCount + 1))]
            this.communicator.notifyProgramPreviewChanged(mockCurrentPrograms, mockCurrentPreviews)
        }
        this.intervalHandle = setInterval(fn, this.tickTime)
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
}

MockConnector.ID = "mock"
MockConnector.defaultTickTime = 3000
MockConnector.defaultChannelCount = 8
MockConnector.defaultChannelNames = ""

module.exports = MockConnector;