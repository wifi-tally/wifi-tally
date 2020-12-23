import {EventEmitter} from 'events'
import Log from '../../domain/Log'
import { ClientSideSocket } from '../../lib/SocketEvents'

class TallyLogTracker extends EventEmitter{
    logs: Map<string, Log[]> | null
    
    constructor(socket: ClientSideSocket, socketEventEmitter: EventEmitter) {
        super()
        this.logs = null

        socket.on('tally.log.state', (data) => {
            this.logs = new Map(data.map(({tallyName, logs}) => {
                return [
                    tallyName,
                    logs.map(log => Log.fromJson(log))
                ]
            }))
            this.logs.forEach((logs, tallyName) => {
                this.emit(`log.${tallyName}`, logs)
            })
        })
        socket.on('tally.log', ({tallyName, log}) => {
            if (!this.logs) {
                console.warn("Disregarding logs, because did not receive the initial logs yet.")
                return
            }
            const theLog = Log.fromJson(log)
            const entry = this.logs.get(tallyName)
            if (!entry) {
                console.warn(`Logs for ${tallyName} might be incomplete.`)
                this.logs.set(tallyName, [theLog])
            } else {
                entry.push(theLog)
                this.logs.set(tallyName, entry)
            }
            this.emit(`log.${tallyName}`, this.logs.get(tallyName))
        })
        socket.emit('events.tallyLog.subscribe')
        socketEventEmitter.on("connected", () => {
            socket.emit('events.tallyLog.subscribe')
        })
    }
}

export default TallyLogTracker
