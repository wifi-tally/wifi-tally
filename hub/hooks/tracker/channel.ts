import {EventEmitter} from 'events'
import Channel from '../../domain/Channel'
import { ClientSideSocket } from '../../lib/SocketEvents'

class ChannelTracker extends EventEmitter{
    channels: Channel[] | null
    
    constructor(socket: ClientSideSocket, socketEventEmitter: EventEmitter) {
        super()
        this.channels = null

        socket.on('channel.state', ({channels}) => {
            this.channels = channels.map(channel => Channel.fromJson(channel))
            this.emit('channels', this.channels)
        })
        socket.emit('events.channel.subscribe')
        socketEventEmitter.on("connected", () => {
            socket.emit('events.channel.subscribe')
        })
    }
}

export default ChannelTracker
