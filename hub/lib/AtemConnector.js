// atem-connection v2.0.0 is needed to monitor status of the connection
const { Atem, AtemConnectionStatus } = require('atem-connection')

const haveValuesChanged = (lastArray, newArray) => {
    if(Array.isArray(lastArray) && Array.isArray(newArray)) {
        return lastArray.length !== newArray.length || lastArray.some((value, index) => value !== newArray[index])
    } else {
        return lastArray !== newArray
    }
}

class AtemConnector {
    constructor(ip, port, communicator) {
        this.ip = ip
        this.port = port
        this.communicator = communicator
        this.currentPrograms = null
        this.currentPreviews = null
        this.isAtemConnected = false
    }
    connect() {
        this.myAtem = new Atem({
            // debug: true,
        })
        this.myAtem.on('info', console.log)
        this.myAtem.on('error', console.error)

        console.log("Connecting to ATEM at " + this.ip + ":" + this.port)

        this.myAtem.connect(this.ip, this.port)
        this.myAtem.on('connected', () => {
            this.isAtemConnected = true
            console.log("Connected to ATEM")
            this.communicator.notifyMixerIsConnected()

            this.currentPrograms = this.myAtem.listVisibleInputs("program").sort()
            this.currentPreviews = this.myAtem.listVisibleInputs("preview").sort()
        
            this.communicator.notifyProgramChanged(this.currentPrograms, this.currentPreviews)
        })
        
        this.myAtem.on('disconnected', () => {
            console.log(
                this.isAtemConnected ? "Lost connection to ATEM" : "Could not connect to ATEM"
            )
            this.isAtemConnected = false
            this.communicator.notifyMixerIsDisconnected()
        })

        this.myAtem.on('stateChanged', (state, pathToChange) => {
            // could be improved if figured out the path
            var programs = this.myAtem.listVisibleInputs("program").sort()
            var previews = this.myAtem.listVisibleInputs("preview").sort()
        
            if(haveValuesChanged(this.currentPrograms, programs) || haveValuesChanged(this.currentPreviews, previews)) {
                console.log("Atem " + pathToChange)
                this.currentPrograms = programs
                this.currentPreviews = previews

                this.communicator.notifyProgramChanged(programs, previews)
            }
        })
    }
    disconnect() {
        console.log("Cutting connection to Atem mixer.")
        this.isAtemConnected = false
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