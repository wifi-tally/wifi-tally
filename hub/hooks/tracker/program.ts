import {EventEmitter} from 'events'
import { ChannelList } from '../../lib/MixerCommunicator'
import { ClientSideSocket } from '../../lib/SocketEvents'

class ProgramTracker extends EventEmitter{
    programs: ChannelList
    previews: ChannelList
    
    constructor(socket: ClientSideSocket, socketEventEmitter: EventEmitter) {
        super()
        this.programs = null
        this.previews = null

        socket.on('program.state', ({programs, previews}) => {
            console.log("program.state", programs, previews)
            this.programs = programs
            this.previews = previews
            this.emit('program', this.programs, this.previews)
        })
        socket.emit('events.program.subscribe')
        socketEventEmitter.on("connected", () => {
            socket.emit('events.program.subscribe')
        })
    }
}

export default ProgramTracker
