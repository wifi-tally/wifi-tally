import {EventEmitter} from 'events'

class ProgramTracker extends EventEmitter{
    programs: string[] | null
    previews: string[] | null
    
    constructor(socket: SocketIOClient.Socket, socketEventEmitter: EventEmitter) {
        super()
        this.programs = null
        this.previews = null

        socket.on('program.changed', ({programs, previews}) => {
            console.log("program.changed", programs, previews)
            this.programs = programs
            this.previews = previews
            this.emit('program', this.programs, this.previews)
        })
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
