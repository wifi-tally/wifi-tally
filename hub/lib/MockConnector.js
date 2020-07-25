// a mock connector that generates random programs and previews

class MockConnector {
    constructor(tickTime, communicator) {
        this.communicator = communicator
        this.tickTime = tickTime
        this.isActive = false
    }
    connect() {
        console.log("Simulating a mock video mixer that changes programs every " + this.tickTime + "ms")
        this.isActive = true
        this.communicator.notifyMixerIsConnected()
        const fn = function() {
            const mockCurrentPrograms = [Math.floor(Math.random() * 6)]
            const mockCurrentPreviews = [Math.floor(Math.random() * 6)]
            this.communicator.notifyProgramChanged(mockCurrentPrograms, mockCurrentPreviews)
        }.bind(this)
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

module.exports = MockConnector;