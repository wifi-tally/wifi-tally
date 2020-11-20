import EventEmitter from 'events'

class ProgramTracker extends EventEmitter{
    constructor(socket, socketEventEmitter) {
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

module.exports = ProgramTracker;