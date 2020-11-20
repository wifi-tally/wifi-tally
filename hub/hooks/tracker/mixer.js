import EventEmitter from 'events'

class MixerTracker extends EventEmitter{
    constructor(socket) {
        super()
        this.connectionState = null
        
        socket.on('mixer.state', (data) => {
            this.connectionState = data.isMixerConnected
            this.emit('connection', this.connectionState)
        })
        socket.emit('events.mixer.subscribe')
    }
}

module.exports = MixerTracker;