import net from 'net'
import Channel from '../../domain/Channel'
import { MixerCommunicator } from '../../lib/MixerCommunicator'
import { Connector } from '../interfaces'
import WirecastConfiguration from './WirecastConfiguration'

export interface WirecastScreen {
    name: string,
    id: number,
    layerIdx: number,
    shotIdx: number,
}
export interface WirecastStatus {
    shots: WirecastScreen[],
    previews: number[],
    lives: number[],
    isConnected: boolean,
    isRecording: boolean,
    isBroadcasting: boolean,
}

class WirecastConnector implements Connector {
    configuration: WirecastConfiguration
    communicator: MixerCommunicator
    hasReceivedPackage: boolean = false
    client?: net.Socket
    reconnectTimeout?: NodeJS.Timeout
    isShuttingDown: boolean = false

    constructor(configuration: WirecastConfiguration, communicator: MixerCommunicator) {
        this.configuration = configuration
        this.communicator = communicator
    }
    connect() {
        const client = new net.Socket()
        this.client = client

        const connectClient = () => {
            console.log(`Connecting to Wirecast Bridge at ${this.configuration.getIp().toString()}:${this.configuration.getPort().toNumber()}`)
            client.connect(this.configuration.getPort().toNumber(), this.configuration.getIp().toString())
        }

        connectClient()

        client.on("connect", () => {
            console.log('Connected to Wirecast Bridge')
            this.communicator.notifyMixerIsConnected()
        })

        client.on("ready", () => {
            // @TODO
        })

        client.on("timeout", () => {
            console.error("Connection to Wirecast Bridge timed out")
        })

        client.on("error", error => {
            console.error(`${error.name}: ${error.message}`)
        })

        client.on('data', this.onData.bind(this))

        client.on('close', (hadError) => {
            this.communicator.notifyMixerIsDisconnected()
            this.hasReceivedPackage = false
            console.log("Connection to Wirecast Bridge closed")

            if (!this.isShuttingDown) {
                console.debug("Trying to reconnect to Wirecast Bridge")
                this.reconnectTimeout = setTimeout(() => {
                    if (this.reconnectTimeout) {
                        clearTimeout(this.reconnectTimeout)
                    }
                    client.connect(this.configuration.getPort().toNumber(), this.configuration.getIp().toString())
                }, 200)
            }
        })

    }

    private shouldProgramBeShownAsPreview(isBroadcasting: boolean, isRecording: boolean): boolean {
        const mode = this.configuration.getLiveMode()
        if (mode === "always") {
            return false
        } else if (mode === "record") {
            return !isRecording
        } else if(mode === "stream") {
            return !isBroadcasting
        } else if(mode === "streamOrRecord") {
            return !isBroadcasting && !isRecording
        } else {
            ((_: never) => {})(mode) // if typescript complains about this, we forgot a case
        }
    }

    private onData(data: Buffer) {
        this.hasReceivedPackage = true
        data.toString().replace(/[\r\n]*$/, "").split("\r\n").forEach(command => {
            try {
                const obj = JSON.parse(command) as WirecastStatus
                
                const lives = obj.lives.map(id => id.toString())
                if (this.shouldProgramBeShownAsPreview(obj.isBroadcasting, obj.isRecording)) {
                    this.communicator.notifyProgramPreviewChanged([], lives)
                } else {
                    const previews = obj.previews.map(id => id.toString())
                    this.communicator.notifyProgramPreviewChanged(lives, previews)
                }

                var shots = obj.shots
                const layers = this.configuration.getLayers()
                if (layers !== null) {
                    shots = shots.filter(shot => layers.includes(shot.layerIdx))
                }

                this.communicator.notifyChannels(
                    shots.map(shot => new Channel(shot.id.toString(), shot.name))
                )
            } catch (e) {
                if (e instanceof SyntaxError) {
                    console.warn(`Error when parsing data from Wirecast Bridge: ${e}`)
                } else { 
                    throw e 
                }
            }
        }, this)
    }
    disconnect() {
        this.isShuttingDown = true
        const promise = new Promise(resolve => {
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout)
                this.reconnectTimeout = undefined;
            }
            if (this.client && ! this.client.destroyed) {
                // @TODO: check if client is still connected and disconnect gracefully
                // if (this.client.isConnected) {
                //     // if we are connected: try to be nice
                //     this.client.end(() => {
                //         console.log("Disconnected from Wirecast Bridge")
                //         resolve(null)
                //     })
                // } else {
                // if not: be rude
                this.client.destroy()
                resolve(null)
                // }
            } else {
                resolve(null)
            }
        })
        this.client = undefined
        return promise
    }
    isConnected() {
        return this.client !== undefined && !this.client.destroyed && this.hasReceivedPackage
    }
    
    static readonly ID: "wirecast" = "wirecast"
}

export default WirecastConnector
