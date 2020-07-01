// a mock connector that generates random programs and previews

class MockConnector {
    constructor(tickTime, emitter) {
        this.emitter = emitter
        this.tickTime = tickTime
        this.isActive = false
        this.connect()
    }
    connect() {
        console.log("Simulating a mock video mixer that changes programs every " + this.tickTime + "ms")
        this.isActive = true
        this.emitter.emit('mixer.connected')
        const fn = function() {
            const mockCurrentPrograms = [Math.floor(Math.random() * 6)]
            const mockCurrentPreviews = [Math.floor(Math.random() * 6)]
            this.emitter.emit('program.changed', mockCurrentPrograms, mockCurrentPreviews)
        }.bind(this)
        this.intervalHandle = setInterval(fn, this.tickTime)
        fn()
    }
    disconnect() {
        console.log("Stopping mock video mixer")
        this.isActive = false
        this.emitter.emit('mixer.disconnected')
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