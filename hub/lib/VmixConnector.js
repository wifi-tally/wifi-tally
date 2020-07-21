var net = require('net')

// @see https://www.vmix.com/help20/index.htm?TCPAPI.html
class VmixConnector {
    constructor(ip, port, emitter) {
        this.ip = ip
        this.port = port
        this.emitter = emitter
        this.client
        this.wasHelloReceived = false
        this.wasSubcribeOkReceived = false
        this.connect()
    }
    connect() {
        const client = new net.Socket()
        this.client = client
        client.connect(this.port, this.ip, function() {
            console.log('Connected')
            client.write("SUBSCRIBE TALLY\r\n")
        })

        client.on('data', this.onData.bind(this))

        client.on('close', function() {
            console.log('Connection closed')
        })

    }
    onData(data) {
        data.toString().replace(/[\r\n]*$/, "").split("\r\n").forEach(command => {
            console.debug("Command: " + command)
            if (command.startsWith("VERSION OK")) {
                this.wasHelloReceived = true
            } else if (command.startsWith("SUBSCRIBE OK TALLY")) {
                this.wasSubcribeOkReceived = true
            } else if (command.startsWith("TALLY OK")) {
                this.handleTallyCommand(command)
            } else {
                this.debug("Ignoring unkown command from vmix")
            }
        }, this)
    }
    handleTallyCommand(command) {
        const result = command.match(/^TALLY OK (\d*)$/)

        if (result == null) {
            console.error("Tally OK command was ill formed")
        } else {
            const [_, state] = result
            var programs = []
            var previews = []
            // vMix encodes tally states as numbers:
            // @see https://www.vmix.com/help20/index.htm?TCPAPI.html
            // 0 = off
            // 1 = program
            // 2 = preview
            state.split('').forEach((val, idx) => {
                if (val =="1") {
                    programs.push(idx + 1)
                } else if (val =="2") {
                    previews.push(idx + 1)
                }
            })

            this.emitter.emit("program.changed", programs, previews)

        }
    }
    disconnect() {
        if (this.client) {
            this.wasHelloReceived = false
            this.wasSubcribeOkReceived = false
            this.client.end()
        }
    }
    isConnected() {
        return this.client && !this.client.destroyed && this.wasHelloReceived && this.wasSubcribeOkReceived
    }
}

VmixConnector.ID = "vmix"
VmixConnector.defaultIp = "127.0.0.1"
VmixConnector.defaultPort = 8099

module.exports = VmixConnector;