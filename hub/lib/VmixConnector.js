var net = require('net')

// @see https://www.vmix.com/help20/index.htm?TCPAPI.html
class VmixConnector {
    constructor(ip, port, communicator) {
        this.ip = ip
        this.port = port
        this.communicator = communicator
        this.client
        this.wasHelloReceived = false
        this.wasSubcribeOkReceived = false
    }
    connect() {
        const client = new net.Socket()
        this.client = client

        const connectClient = () => {
            this.wasHelloReceived = false
            this.wasSubcribeOkReceived = false
            client.connect(this.port, this.ip)
        }

        connectClient()

        client.on("connect", () => {
            console.log('Connected to vMix')
            this.communicator.notifyMixerIsConnected()
        })

        client.on("ready", () => {
            client.write("SUBSCRIBE TALLY\r\n")
        })

        client.on("timeout", () => {
            console.error("Connection to vMix timed out")
        })

        client.on("error", error => {
            console.error(error.name + ": " + error.message)
        })

        client.on('data', this.onData.bind(this))

        client.on('close', (hadError) => {
            this.communicator.notifyMixerIsDisconnected()
            console.log("Connection to vMix closed")

            if (hadError) {
                console.debug("Connection to vMix is reconnected after an error")
                client.connect(this.port, this.ip)
            }
        })

    }
    onData(data) {
        data.toString().replace(/[\r\n]*$/, "").split("\r\n").forEach(command => {
            console.debug("> " + command)
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

            this.communicator.notifyProgramChanged(programs, previews)
        }
    }
    disconnect() {
        this.wasHelloReceived = false
        this.wasSubcribeOkReceived = false
        const promise = new Promise(resolve => {
            if (this.client && ! this.client.destroyed) {
                if (this.client.isConnected) {
                    // if we are connected: try to be nice
                    this.client.end(() => {
                        console.log("Disconnected from vMix")
                        resolve()
                    })
                } else {
                    // if not: be rude
                    this.client.destroy()
                    resolve()
                }
            } else {
                resolve()
            }
        })
        this.client = null
        return promise
    }
    isConnected() {
        return this.client && !this.client.destroyed && this.wasHelloReceived && this.wasSubcribeOkReceived
    }
}

VmixConnector.ID = "vmix"
VmixConnector.defaultIp = "127.0.0.1"
VmixConnector.defaultPort = 8099

module.exports = VmixConnector;