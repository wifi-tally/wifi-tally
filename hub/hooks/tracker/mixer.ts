import {EventEmitter} from 'events'

class MixerTracker extends EventEmitter{
    connectionState: boolean | null

    constructor(socket: SocketIOClient.Socket) {
        super()
        this.connectionState = null
        
        socket.on('mixer.state', (data) => {
            this.connectionState = data.isMixerConnected
            this.emit('connection', this.connectionState)
        })
        socket.emit('events.mixer.subscribe')
    }
}

export default MixerTracker
