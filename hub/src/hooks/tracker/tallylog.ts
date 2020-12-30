import {EventEmitter} from 'events'
import Log from '../../domain/Log'
import { ClientSideSocket } from '../../lib/SocketEvents'

class TallyLogTracker extends EventEmitter{
    logs: Map<string, Log[]> | null
    
    constructor(socket: ClientSideSocket, socketEventEmitter: EventEmitter) {
        super()
        this.logs = null

        socket.on('tally.log.state', (data) => {
            this.logs = new Map(data.map(({tallyId, logs}) => {
                return [
                    tallyId,
                    logs.map(log => Log.fromJson(log))
                ]
            }))
            this.logs.forEach((logs, tallyName) => {
                this.emit(`log.${tallyName}`, logs)
            })
        })
        socket.on('tally.log', ({tallyId, log}) => {
            if (!this.logs) {
                console.warn("Disregarding logs, because did not receive the initial logs yet.")
                return
            }
            const theLog = Log.fromJson(log)
            const entry = this.logs.get(tallyId)
            if (!entry) {
                console.warn(`Logs for ${tallyId} might be incomplete.`)
                this.logs.set(tallyId, [theLog])
            } else {
                entry.push(theLog)
                this.logs.set(tallyId, entry)
            }
            this.emit(`log.${tallyId}`, this.logs.get(tallyId))
        })
        socket.emit('events.tallyLog.subscribe')
        socketEventEmitter.on("connected", () => {
            socket.emit('events.tallyLog.subscribe')
        })
    }
}

export default TallyLogTracker
