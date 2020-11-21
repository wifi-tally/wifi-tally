import {EventEmitter} from 'events'
import { ClientSideSocket } from '../../lib/SocketEvents'

class MixerTracker extends EventEmitter{
    connectionState: boolean | null

    constructor(socket: ClientSideSocket) {
        super()
        this.connectionState = null
        
        socket.on('mixer.state', ({isConnected}) => {
            this.connectionState = isConnected
            this.emit('connection', this.connectionState)
        })
        socket.emit('events.mixer.subscribe')
    }
}

export default MixerTracker
