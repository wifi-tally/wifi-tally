import net from 'net'
import xml2js from 'xml2js'
import { MixerCommunicator } from '../../lib/MixerCommunicator'
import { Connector } from '../interfaces'
import VmixConfiguration from './VmixConfiguration'

// @see https://www.vmix.com/help20/index.htm?TCPAPI.html
class VmixConnector implements Connector {
    configuration: VmixConfiguration
    communicator: MixerCommunicator
    client?: net.Socket
    wasHelloReceived: boolean
    wasSubcribeOkReceived: boolean
    intervalHandle: any
    xmlQueryInterval: number
    waitForHelloPeriod: number
    reconnectTimeout?: NodeJS.Timeout
    waitForHelloTimeout?: NodeJS.Timeout

    constructor(configuration: VmixConfiguration, communicator: MixerCommunicator) {
        this.configuration = configuration
        this.communicator = communicator
        this.wasHelloReceived = false
        this.wasSubcribeOkReceived = false
        this.xmlQueryInterval = 5000
        this.waitForHelloPeriod = 5000
    }
    connect() {
        const client = new net.Socket()
        this.client = client

        const connectClient = () => {
            this.wasHelloReceived = false
            this.wasSubcribeOkReceived = false
            console.log(`Connecting to Vmix at ${this.configuration.getIp().toString()}:${this.configuration.getPort().toNumber()}`)
            client.connect(this.configuration.getPort().toNumber(), this.configuration.getIp().toString())
        }

        const reconnectClient = () => {
            this.disconnect().then(() =>
                this.reconnectTimeout = setTimeout(() => {
                    if (this.reconnectTimeout) {
                        clearTimeout(this.reconnectTimeout)
                    }
                    client.connect(this.configuration.getPort().toNumber(), this.configuration.getIp().toString())
                }, 200)
            )
        }

        const queryXml = () => {
            if(!client.connecting && !client.destroyed) {
                client.write("XML\r\n")
            }
        }

        connectClient()

        client.on("connect", () => {
            console.debug(`TCP connection to ${this.configuration.getIp().toString()}:${this.configuration.getPort().toNumber()} established`)
            this.waitForHelloTimeout = setTimeout(() => {
                if (this.waitForHelloTimeout) {
                    clearTimeout(this.waitForHelloTimeout)
                }
                
                if (!this.wasHelloReceived || !this.wasSubcribeOkReceived) {
                    reconnectClient()
                    console.error(`The remote at ${this.configuration.getIp().toString()}:${this.configuration.getPort().toNumber()} did not identify as vMix TCPAPI. Is this the correct port for the TCPAPI? (default ${VmixConfiguration.defaultPort})`)
                }
            }, this.waitForHelloPeriod)
        })

        client.on("ready", () => {
            client.write("SUBSCRIBE TALLY\r\n")
            // @TODO: we need to poll for new channels or renames. Is there a way to subscribe to those?
            this.intervalHandle = setInterval(queryXml, this.xmlQueryInterval)
            queryXml()
        })

        client.on("timeout", () => {
            console.error("Connection to vMix timed out")
        })

        client.on("error", error => {
            console.error(`${error.name}: ${error.message}`)
        })

        client.on('data', this.onData.bind(this))

        client.on('close', (hadError) => {
            this.communicator.notifyMixerIsDisconnected()
            console.log("Connection to vMix closed")

            if(this.intervalHandle) {
                clearInterval(this.intervalHandle);
                this.intervalHandle = undefined;
            }

            if (hadError) {
                console.debug("Connection to vMix is reconnected after an error")
                reconnectClient()
            }
        })

    }
    private onConnectionComplete() {
        console.log("Connection to vMix complete")
        this.communicator.notifyMixerIsConnected()
    }
    private onData(data: Buffer) {
        data.toString().replace(/[\r\n]*$/, "").split("\r\n").forEach(command => {
            console.debug(`> ${command}`)
            if (command.startsWith("VERSION OK")) {
                this.wasHelloReceived = true
                console.debug("Connection to vMix established")
                if (this.wasHelloReceived && this.wasSubcribeOkReceived) { this.onConnectionComplete() }
            } else if (command.startsWith("SUBSCRIBE OK TALLY")) {
                this.wasSubcribeOkReceived = true
                console.debug("Successfully subscribed to tally updates from vMix")
                if (this.wasHelloReceived && this.wasSubcribeOkReceived) { this.onConnectionComplete() }
            } else if (command.startsWith("TALLY OK")) {
                this.handleTallyCommand(command)
            } else if (command.startsWith("XML ")) {
                // @TODO: it would be better to detect the "XML" response itself, not the payload
            } else if (command.startsWith("<vmix>")) {  
                this.handleXmlCommand(command)
            } else {
                console.debug("Ignoring unkown command from vmix")
            }
        }, this)
    }
    private handleTallyCommand(command: string) {
        const result = command.match(/^TALLY OK (\d*)$/)

        if (result === null) {
            console.error("Tally OK command was ill formed")
        } else {
            const state = result[1]
            let programs: string[] = []
            let previews: string[] = []
            // vMix encodes tally states as numbers:
            // @see https://www.vmix.com/help20/index.htm?TCPAPI.html
            // 0 = off
            // 1 = program
            // 2 = preview
            state.split('').forEach((val, idx) => {
                if (val === "1") {
                    programs.push(`${idx + 1}`)
                } else if (val === "2") {
                    previews.push(`${idx + 1}`)
                }
            })

            this.communicator.notifyProgramPreviewChanged(programs, previews)
        }
    }
    private handleXmlCommand(command: string) {
        xml2js.parseString(command, (error, result) => {
            if (error) {
                console.error(`Error parsing XML response from vMix: ${error}`)
            } else {
                const inputs = (result.vmix || {}).inputs
                if(inputs === undefined) {
                    console.log("XML from vMix looks faulty. Could not find inputs.")
                } else {
                    const count = inputs[0].input.length
                    const names = inputs[0].input.reduce((map, input, idx) => {
                        map[idx+1] = input.$.shortTitle
                        return map
                    }, {})
                    this.communicator.notifyChannelNames(count, names)
                }
            }
        })
    }
    disconnect() {
        this.wasHelloReceived = false
        this.wasSubcribeOkReceived = false
        const promise = new Promise(resolve => {
            if(this.intervalHandle) {
                clearInterval(this.intervalHandle);
                this.intervalHandle = undefined;
            }
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout)
                this.reconnectTimeout = undefined;
            }
            if (this.waitForHelloTimeout) {
                clearTimeout(this.waitForHelloTimeout)
                this.waitForHelloTimeout = undefined;
            }
            if (this.client && ! this.client.destroyed) {
                // @TODO: check if client is still connected and disconnect gracefully
                // if (this.client.isConnected) {
                //     // if we are connected: try to be nice
                //     this.client.end(() => {
                //         console.log("Disconnected from vMix")
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
        return this.client !== undefined && !this.client.destroyed && this.wasHelloReceived && this.wasSubcribeOkReceived
    }
    
    static readonly ID: "vmix" = "vmix"
}

export default VmixConnector
