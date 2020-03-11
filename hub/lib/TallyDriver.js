const Tally = require('../domain/Tally')
const dgram = require('dgram');

const tallyHighlightTime = 1000 // ms
// the more keep alives you send the less likely it is that
// the tally shows a wrong state, but you send more packages
// over the network.
const keepAlivesPerSecond = 10

const updateTally = function(tally, io, programs, previews) {
    if(tally.isConnected()) {
        var command = "release"
        if(tally.isHighlighted()) {
            command = "highlight"
        } else if(programs === null) {
            // mixer is disconnected
            command = "unknown"
        } else if (tally.isIn(programs)) {
            command = "on-air"
        } else if (previews !== null && tally.isIn(previews)) {
            command = "preview"
        }
        io.send(command, tally.port, tally.address)
    }
}

// - handles connections with Tallies.
// - emits signals when tallies connect, go missing or disconnect
class TallyDriver {
    constructor(tallies, emitter) {
        this.tallies = new Map();
        (tallies || []).forEach(tally => {
            tally = Tally.fromValueObject(tally)
            this.tallies.set(tally.name, tally)
        })
        this.emitter = emitter
        this.lastPrograms = null
        this.lastPreviews = null
        this.io = dgram.createSocket('udp4')
        
        this.io.on('error', (err) => {
            console.log('server error: ' + err.stack);
            this.io.close();
        });
        
        this.io.on('message', (msg, rinfo) => {
            msg = msg.toString().trim()
            if (msg.startsWith("tally-ho")) {
                var tallyName = msg.substring(9)
                if (!this.tallies.has(tallyName)) {
                    const tally = new Tally(tallyName, -1)
                    this.tallies.set(tallyName, tally)
                }
                const tally = this.tallies.get(tallyName)
                if(tally.state != Tally.CONNECTED) {
                    tally.state = Tally.CONNECTED
                    tally.address = rinfo.address;
                    tally.port = rinfo.port;
                    this.emitter.emit('tally.connected', tally)
                }
                if (tally.address !== rinfo.address || tally.port !== rinfo.port) {
                    tally.address = rinfo.address;
                    tally.port = rinfo.port;
                    this.emitter.emit('tally.changed', tally)
                }
                this.emitter.emit('tally.reported', this.tallies.get(tallyName))
            } else if (msg.startsWith("log")) {
                // @TODO
                var logMessage = msg.substring(4)
                console.log(logMessage)
            } else {
                console.log("Received unknown package " + msg)
            }
        });
        
        this.io.on('listening', () => {
            const address = this.io.address();
            console.log('Listening for Tallies on  ' + address.address + ':' + address.port);
        });
        
        this.io.bind(7411)

        // watchdog to check if a tally disconnected
        const lastTallyReport = new Map();
        this.emitter.on('tally.reported', tally => {
            lastTallyReport.set(tally.name, new Date())
            tally.state = Tally.CONNECTED
        })

        setInterval(function() {
            const now = new Date()
            this.tallies.forEach(tally => {
                if(!lastTallyReport.has(tally.name)) {
                    tally.state = Tally.DISCONNECTED
                } else {
                    const diff = now - lastTallyReport.get(tally.name) // milliseconds
                    if(diff > 30000) {
                        if(tally.state != Tally.DISCONNECTED) {
                            tally.state = Tally.DISCONNECTED
                            this.emitter.emit('tally.timedout', tally)
                        }
                    } else if(diff > 3000) {
                        if(tally.state != Tally.MISSING) {
                            tally.state = Tally.MISSING
                            this.emitter.emit('tally.missing', tally)
                        }
                    }
                }
            })
        }.bind(this), 500)

        // send keep-alive messages
        // - show the tally, we are still here
        // - compensate for lost packages
        setInterval(function() {
            this.updateTallies()
        }.bind(this), 1000 / keepAlivesPerSecond)
    }
    highlight(tallyName) {
        console.log("highlight", tallyName)
        if(this.tallies.has(tallyName)) {
            const tally = this.tallies.get(tallyName)
            setTimeout(function(){
                tally.setHighlight(false)
                this.updateTally(tallyName)
            }.bind(this), tallyHighlightTime)
            tally.setHighlight(true)
            this.updateTally(tallyName)
        }
    }
    setState(programs, previews) {
        this.lastPrograms = programs
        this.lastPreviews = previews

        this.updateTallies()
    }
    patchTally(tallyName, channelId) {
        if(this.tallies.has(tallyName)) {
            const tally = this.tallies.get(tallyName)
            tally.channelId = channelId
            this.emitter.emit('tally.changed', tally)
        }
    }
    removeTally(tallyName) {
        if(this.tallies.has(tallyName)) {
            const tally = this.tallies.get(tallyName)
            this.tallies.delete(tallyName)
            this.emitter.emit('tally.removed', tally)
        }
    }
    updateTally(tallyName) {
        const tally = this.tallies.get(tallyName)
        updateTally(tally, this.io, this.lastPrograms, this.lastPreviews)
    }
    updateTallies() {
        this.tallies.forEach(tally => updateTally(tally, this.io, this.lastPrograms, this.lastPreviews))
    }
    toValueObjects() {
        return Array.from(this.tallies.values()).map(tally => tally.toValueObject())
    }
    toValueObjectsForSave() {
        return Array.from(this.tallies.values()).map(tally => {
            tally = tally.toValueObject()
            delete tally.state
            delete tally.address
            delete tally.port
            return tally
        })
    }
}

module.exports = TallyDriver;
