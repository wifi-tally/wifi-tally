import RolandConnector from './RolandVR50HDConnector'
import RolandConfiguration from './RolandVR50HDConfiguration'
import { Server } from 'net'

const waitUntil = (fn) => {
    return new Promise((resolve, _) => {
        setInterval(() => {
            if (fn() === true) {
                resolve()
            }
        }, 100)
    })
}

class MockCommunicator {
    constructor(configuration, emitter) {
        this.isConnected = false
    }

    notifyProgramChanged(programs) {
        this.programs = programs
    }

    notifyChannelNames(count, names) {
        this.channelCount = count
        this.channelNames = names
    }

    notifyMixerIsConnected() {
        this.isConnected = true
    }

    notifyMixerIsDisconnected() {
        this.isConnected = false
    }
}

function createCommunicator(ip, port) {
    const communicator = new MockCommunicator()
    const configuration = new RolandConfiguration()
    configuration.setIp(ip)
    configuration.setPort(port)
    const roland = new RolandConnector(configuration, communicator)

    return [roland, communicator]
}

describe('RoalandVR50HDConnector', () => {
    beforeEach(() => {
        global.rolandServerConfig = {}
        const server = Server((sck) => {
            sck.on('data', data => {
                const command = data.toString().trim()
                console.debug(`S< ${command}`)
                if(command.startsWith("\u0002CPG:1")) {
                    global.rolandServerConfig.gotCPGCommand = true
                    sck.write(Buffer.from(`\u0002QPG:0;\n`))
                } else {
                    console.log(`Roland Mock received an unknown command: ${command}`)
                }
            })

            global.rolandServerConfig.selectVideoInput = function(id) {
                sck.write(Buffer.from(`\u0002QPG:${id};\n`))
            }
        })

        const promise = new Promise((resolve, reject) => {
            server.listen({
                port: 0,
                host: 'localhost',
            }, (error) => {
                if (error) {
                    console.error(error)
                    reject(error)
                } else {
                    global.rolandServerConfig.serverIp = server.address().address
                    global.rolandServerConfig.serverPort = server.address().port
                    resolve()
                }
            })
        })

        global.rolandServerConfig.close = server.close.bind(server)

        return promise
    })
    afterEach(() => {
        if (global.rolandServerConfig) {
            return new Promise((resolve, reject) => {
                global.rolandServerConfig.close((error) => {
                    if (error) {
                        console.error(error)
                        reject(error)
                    } else {
                        resolve()
                    }
                })
            })
        }
    })
    test('parses program states', async () => {
        const server = global.rolandServerConfig
        const [roland, communicator] = createCommunicator(server.serverIp, server.serverPort)

        try {
            roland.connect()
            await waitUntil(() => communicator.programs !== undefined).then(() => {
                expect(communicator.programs).toEqual(["1"])
            })

            global.rolandServerConfig.selectVideoInput(1)
            await waitUntil(() => communicator.programs !== ["1"]).then(() => {
                expect(communicator.programs).toEqual(["2"])
            })
        } finally {
            await roland.disconnect()
        }
    })
})
