import {EventEmitter} from 'events'
import Tally from '../../domain/Tally'
import { ClientSideSocket } from '../../lib/SocketEvents'

class TallyTracker extends EventEmitter{
    tallies: Tally[] | null
    
    constructor(socket: ClientSideSocket, socketEventEmitter: EventEmitter) {
        super()
        this.tallies = null

        socket.on('tally.state', ({tallies}) => {
            this.tallies = tallies.map(tally => Tally.fromJson(tally))
            this.emit('tallies', this.tallies)
        })
        socket.emit('events.tally.subscribe')
        socketEventEmitter.on("connected", () => {
            socket.emit('events.tally.subscribe')
        })
    }
}

export default TallyTracker
