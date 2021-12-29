import net from 'net'
import { MixerCommunicator } from '../../lib/MixerCommunicator'
import { Connector } from '../interfaces'
import RolandVR50HDConfiguration from './RolandVR50HDConfiguration'

// @see https://static.roland.com/assets/media/pdf/VR-50HD-MK2_reference_eng02_W.pdf
class RolandVR50HD implements Connector {
    configuration: RolandVR50HDConfiguration
    communicator: MixerCommunicator
    client?: net.Socket
    wasTallyDataReceived: boolean
    reconnectTimeout?: NodeJS.Timeout

    constructor(configuration: RolandVR50HDConfiguration, communicator: MixerCommunicator) {
        this.configuration = configuration
        this.communicator = communicator
        this.wasTallyDataReceived = false
    }
    connect() {
        const client = new net.Socket()
        this.client = client

        const connectClient = () => {
            this.wasTallyDataReceived = false
            console.log(`Connecting to Roland VR-50HD MK2 at ${this.configuration.getIp().toString()}:${this.configuration.getPort().toNumber()}`)
            // @TODO: I did not find anything that suggests the channels could be renamed or their number changes
            this.communicator.notifyChannelNames(5, {1: "Input 1", 2: "Input 2", 3: "Input 3", 4: "Input 4", 5: "Still"})
            client.connect(this.configuration.getPort().toNumber(), this.configuration.getIp().toString())
        }

        connectClient()

        client.on("connect", () => {
            console.log('Connected to Roland VR-50HD MK2')
            this.communicator.notifyMixerIsConnected()
        })

        client.on("ready", () => {
            // "Enable spontaneously sending status of the VIDEO INPUT SELECT buttons"
            const command = "\u0002CPG:1;\n"
            console.debug(`< ${command}`)
            client.write(command)
        })

        client.on("timeout", () => {
            console.error("Connection to Roland VR-50HD MK2 timed out")
        })

        client.on("error", error => {
            console.error(`${error.name}: ${error.message}`)
        })

        client.on('data', this.onData.bind(this))

        client.on('close', (hadError) => {
            this.communicator.notifyMixerIsDisconnected()
            console.log("Connection to Roland VR-50HD MK2 closed")

            if (hadError) {
                console.debug("Connection to Roland VR-50HD MK2 is reconnected after an error")
                this.reconnectTimeout = setTimeout(() => {
                    if (this.reconnectTimeout) {
                        clearTimeout(this.reconnectTimeout)
                    }
                    client.connect(this.configuration.getPort().toNumber(), this.configuration.getIp().toString())
                }, 200)
            }
        })

    }
    private onData(data: Buffer) {
        const command = data.toString().trim()
        console.debug(`> ${command}`)
        if (command.startsWith("\u0002VER:")) {
            console.log(`Roland reported version as "${command.substring(5)}"`)
        } else if (command.startsWith("\u0002ERR:")) {
            console.error(`Roland API reported an error with code ${command.substring(5)}`)
        } else if (command.startsWith("\u0002QPG:")) {
            const result = command.match(/QPG:(\d+);/)

            if (result === null) {
                console.error("Video Input Select command was ill formed")
            } else {
                this.wasTallyDataReceived = true
                const programChannelId = parseInt(result[1])
                // Roland starts counting at 0, but it is "Input 1"
                const programs = [`${programChannelId+1}`]
                this.communicator.notifyProgramChanged(programs)
            }
        } else {
            console.debug(`Ignoring unkown command from Roland: ${command}`)
        }
    }
    disconnect() {
        this.wasTallyDataReceived = false
        const promise = new Promise(resolve => {
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout)
                this.reconnectTimeout = undefined;
            }
            if (this.client && ! this.client.destroyed) {
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
        return this.client !== undefined && !this.client.destroyed && this.wasTallyDataReceived
    }
    
    static readonly ID: "rolandVR50HD" = "rolandVR50HD"
}

export default RolandVR50HD
