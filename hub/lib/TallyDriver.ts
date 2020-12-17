import { ConnectionState, Tally } from '../domain/Tally'
import dgram from 'dgram'
import ServerEventEmitter from './ServerEventEmitter'
import { ChannelList } from './MixerCommunicator'
import { AppConfiguration } from './AppConfiguration'

const tallyHighlightTime = 1000 // ms
// the more keep alives you send the less likely it is that
// the tally shows a wrong state, but you send more packages
// over the network.
const keepAlivesPerSecond = 10

const updateTally = function(tally: Tally, io: dgram.Socket, programs: ChannelList, previews: ChannelList) {
    if(tally.isActive()) {
        let command = "release"
        if(tally.isHighlighted()) {
            command = "highlight"
        } else if(programs === null && tally.isPatched()) {
            // mixer is disconnected
            command = "unknown"
        } else if (programs !== null && tally.isIn(programs)) {
            command = "on-air"
        } else if (previews !== null && tally.isIn(previews)) {
            command = "preview"
        }
        io.send(command, tally.port, tally.address)
    }
}

class InvalidCommandError extends Error {
    constructor(...args) {
        super(...args)

        this.message = `Received an invalid command: "${this.message}"`
    }
}

// - handles connections with Tallies.
// - emits signals when tallies connect, go missing or disconnect
export class TallyDriver {
    io: dgram.Socket
    tallies: Map<string, Tally>
    emitter: ServerEventEmitter
    lastPrograms: ChannelList
    lastPreviews: ChannelList
    configuration: AppConfiguration

    constructor(configuration: AppConfiguration, emitter: ServerEventEmitter) {
        this.configuration = configuration
        this.tallies = new Map();
        (configuration.getTallies() || []).forEach(tally => {
            this.tallies.set(tally.name, tally)
        })
        this.emitter = emitter
        this.lastPrograms = null
        this.lastPreviews = null
        this.io = dgram.createSocket('udp4')
        
        this.io.on('error', (err) => {
            console.log(`server error: ${err.stack}`);
            this.io.close();
        });
        
        this.io.on('message', (msg, rinfo) => {
            try {
                const theMsg = msg.toString().trim()
                if (theMsg.startsWith("tally-ho")) {
                    const tallyName = TallyDriver.parseTallyHo(theMsg)
                    this.tallyReported(tallyName, rinfo)
                } else if (theMsg.startsWith("log")) {
                    const [tallyName, severity, message] = TallyDriver.parseLog(theMsg)
                    const tally = this.tallyReported(tallyName, rinfo)
                    if (tally) {
                        const log = tally.addLog(new Date(), severity, message)
                        this.emitter.emit('tally.logged', {tally, log})
                    }
                } else {
                    throw new InvalidCommandError(theMsg)
                }
            } catch (e) {
                if (e instanceof InvalidCommandError) {
                    console.warn(e.message)
                } else {
                    throw e
                }
            }
        });
        
        this.io.on('listening', () => {
            const address = this.io.address()
            console.log(`Listening for Tallies on ${address.address}:${address.port}`)
        });
        
        this.io.bind(7411)

        // watchdog to check if a tally disconnected
        const lastTallyReport: Map<string, Date> = new Map();
        this.emitter.on('tally.reported', tally => {
            lastTallyReport.set(tally.name, new Date())
            tally.state = ConnectionState.CONNECTED
        })

        setInterval(() => {
            const now = new Date()
            this.tallies.forEach(tally => {
                const lastTallyReportDate = lastTallyReport.get(tally.name)
                if(!lastTallyReportDate) {
                    tally.state = ConnectionState.DISCONNECTED
                } else {
                    const diff = now.getTime() - lastTallyReportDate.getTime() // milliseconds
                    if(diff > 30000) {
                        if(tally.state !== ConnectionState.DISCONNECTED) {
                            tally.state = ConnectionState.DISCONNECTED
                            this.emitter.emit('tally.timedout', {tally, diff})
                            const log = tally.addLog(new Date(), null, `Tally got disconnected after not reporting for ${diff}ms`)
                            this.emitter.emit('tally.logged', {tally, log})
                        }
                    } else if(diff > 3000) {
                        if(tally.state !== ConnectionState.MISSING) {
                            tally.state = ConnectionState.MISSING
                            this.emitter.emit('tally.missing', {tally, diff})
                            const log = tally.addLog(new Date(), null, `Tally got missing. It has not reported for ${diff}ms`)
                            this.emitter.emit('tally.logged', {tally, log})
                        }
                    }
                }
            })
        }, 500)

        // send keep-alive messages
        // - show the tally, we are still here
        // - compensate for lost packages
        setInterval(() => {
            this.updateTallies()
        }, 1000 / keepAlivesPerSecond)
    }
    private tallyReported(tallyName, rinfo) {
        let tally = this.tallies.get(tallyName)
        if (!tally) {
            tally = new Tally(tallyName)
            this.tallies.set(tallyName, tally)
            this.configuration.setTallies(Array.from(this.tallies.values()))
        }
        if(tally.state !== ConnectionState.CONNECTED) {
            tally.state = ConnectionState.CONNECTED
            tally.address = rinfo.address;
            tally.port = rinfo.port;
            this.emitter.emit('tally.connected', tally)
        }
        if (tally.address !== rinfo.address || tally.port !== rinfo.port) {
            tally.address = rinfo.address;
            tally.port = rinfo.port;
            this.emitter.emit('tally.changed', tally)
        }
        this.emitter.emit('tally.reported', tally)
        return tally
    }
    highlight(tallyName) {
        console.log("highlight", tallyName)
        const tally = this.tallies.get(tallyName)
        if (tally) {
            setTimeout(() => {
                tally.setHighlight(false)
                this.updateTally(tallyName)
            }, tallyHighlightTime)
            tally.setHighlight(true)
            this.updateTally(tallyName)
        }
    }
    setState(programs: ChannelList, previews: ChannelList) {
        this.lastPrograms = programs
        this.lastPreviews = previews

        this.updateTallies()
    }
    patchTally(tallyName: string, channelId: string) {
        const tally = this.tallies.get(tallyName)
        if (tally) {
            tally.channelId = channelId
            this.configuration.setTallies(Array.from(this.tallies.values()))

            this.emitter.emit('tally.changed', tally)
        }
    }
    removeTally(tallyName: string) {
        const tally = this.tallies.get(tallyName)
        if(tally) {
            this.tallies.delete(tallyName)
            this.configuration.setTallies(Array.from(this.tallies.values()))
            this.emitter.emit('tally.removed', tally)
        }
    }
    updateTally(tallyName: string) {
        const tally = this.tallies.get(tallyName)
        if (tally) {
            updateTally(tally, this.io, this.lastPrograms, this.lastPreviews)
        }
    }
    updateTallies() {
        this.tallies.forEach(tally => updateTally(tally, this.io, this.lastPrograms, this.lastPreviews))
    }
    getTallies() {
        return Array.from(this.tallies.values())
    }
    /** @deprecated */
    toValueObjects() {
        return Array.from(this.tallies.values()).map(tally => tally.toJson())
    }

    getTally(tallyName: string) {
        if(this.tallies.has(tallyName)) {
            const tally = this.tallies.get(tallyName)
            return tally
        }
    }

    static parseTallyHo = function(cmd: string) {
        const result = cmd.match(/^([^ ]+) "(.+)"/)
        if (result === null) {
            throw new InvalidCommandError(cmd)
        } else {
            const [_, command, name] = result
            if (command !== "tally-ho") {
                throw new InvalidCommandError(command)
            }
            return name
        }
    }

    static parseLog = function(cmd: string) : [string, string, string] {
        const result = cmd.match(/^([^ ]+) "(.+)" ([^ ]+) "(.*)"/)
    
        if (result === null) {
            throw new InvalidCommandError(cmd)
        } else {
            const [_, command, name, severity, message] = result
            if (command !== "log") {
                throw  new InvalidCommandError(command)
            }
            return [name, severity, message]
        }
    }
}
