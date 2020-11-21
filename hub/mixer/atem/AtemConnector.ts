import { MixerCommunicator } from '../../lib/MixerCommunicator'
import {Connector} from '../interfaces'
// atem-connection v2.0.0 is needed to monitor status of the connection
import { Atem } from 'atem-connection'
import { InternalPortType } from 'atem-connection/dist/enums'
import Channel from '../../domain/Channel'

class AtemConnector implements Connector {
    ip: string
    port: number
    communicator: MixerCommunicator
    isAtemConnected: boolean
    myAtem: Atem | null
    
    constructor(ip: string, port: number, communicator: MixerCommunicator) {
        this.ip = ip
        this.port = port
        this.communicator = communicator
        this.isAtemConnected = false
    }
    private onStateChange() {
        if (this.myAtem) {
            const programs = this.myAtem.listVisibleInputs("program").sort().map(i => i.toString())
            const previews = this.myAtem.listVisibleInputs("preview").sort().map(i => i.toString())
            this.communicator.notifyProgramPreviewChanged(programs, previews)

            const channels = Object.values(this.myAtem.state?.inputs || {}).reduce((channels: Channel[], input) => {
                if (input && input.internalPortType === InternalPortType.External) {
                    channels.push(new Channel(input.inputId.toString(), input.longName))
                }
                return channels
            }, [])
            this.communicator.notifyChannels(channels)
        }
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

    static ID = "atem"
    static defaultIp = "127.0.0.1"
    static defaultPort = 9910
}

export default AtemConnector
