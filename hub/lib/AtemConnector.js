// atem-connection v2.0.0 is needed to monitor status of the connection
const { Atem, AtemConnectionStatus } = require('atem-connection')

class AtemConnector {
    constructor(ip, port, communicator) {
        this.ip = ip
        this.port = port
        this.communicator = communicator
        this.isAtemConnected = false
    }
    onStateChange() {
        const programs = this.myAtem.listVisibleInputs("program").sort()
        const previews = this.myAtem.listVisibleInputs("preview").sort()
        this.communicator.notifyProgramPreviewChanged(programs, previews)

        const channelNames = Object.values(this.myAtem.state.inputs).reduce((map, input) => {
            if (input.isExternal) {
                map[input.inputId] = input.longName
            }
            return map
        }, {})
        const channelCount = Object.keys(channelNames).length
        this.communicator.notifyChannelNames(channelCount, channelNames)
    }
    connect() {
        this.myAtem = new Atem({
            // debug: true,
        })
        this.myAtem.on('info', console.log)
        this.myAtem.on('error', console.error)

        console.log(`Connecting to ATEM at ${this.ip}:${this.port}`)

        this.myAtem.connect(this.ip, this.port)
        this.myAtem.on('connected', () => {
            this.isAtemConnected = true
            console.log("Connected to ATEM")
            this.communicator.notifyMixerIsConnected()
            this.onStateChange()
        })
        
        this.myAtem.on('disconnected', () => {
            console.log(
                this.isAtemConnected ?
                "Lost connection to ATEM" :
                "Could not connect to ATEM. This could mean that the maximum number of devices are already connected to ATEM."
            )
            this.isAtemConnected = false
            this.communicator.notifyMixerIsDisconnected()
        })

        this.myAtem.on('stateChanged', this.onStateChange.bind(this))
    }
    disconnect() {
        console.log("Cutting connection to Atem mixer.")
        this.isAtemConnected = false
        this.communicator.notifyMixerIsDisconnected()
        if(this.myAtem) {
            this.myAtem.removeAllListeners("info")
            this.myAtem.removeAllListeners("error")
            this.myAtem.removeAllListeners("connected")
            this.myAtem.removeAllListeners("disconnected")
            this.myAtem.removeAllListeners("stateChanged")
            this.myAtem.destroy()
        }
    }
    isConnected() {
        // @TODO: is there an API function so that we do not need to track state?
        return this.isAtemConnected
    }
}

AtemConnector.ID = "atem"
AtemConnector.defaultIp = "127.0.0.1"
AtemConnector.defaultPort = 9910

module.exports = AtemConnector;