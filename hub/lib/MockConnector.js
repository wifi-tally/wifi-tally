// a mock connector that generates random programs and previews

class MockConnector {
    constructor(tickTime, emitter) {
        this.emitter = emitter
        this.tickTime = tickTime
        this.connect()
    }
    connect() {
        console.log("Simulating a mock video mixer that changes programs every " + this.tickTime + "ms")
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
        if(this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = undefined;
        }
    }
}

MockConnector.ID = "mock"
MockConnector.defaultTickTime = 3000

module.exports = MockConnector;