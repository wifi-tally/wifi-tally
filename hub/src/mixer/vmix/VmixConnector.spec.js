import VmixConnector from './VmixConnector'
import VmixConfiguration from './VmixConfiguration'
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

    notifyProgramPreviewChanged(programs, previews) {
        this.programs = programs
        this.previews = previews
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

function createVmixCommunicator(ip, port) {
    const communicator = new MockCommunicator()
    const configuration = new VmixConfiguration()
    configuration.setIp(ip)
    configuration.setPort(port)
    const vmix = new VmixConnector(configuration, communicator)

    return [vmix, communicator]
}

describe('VmixConnector', () => {
    describe('onData', () => {
        beforeEach(() => {
            global.vMixServerConfig = {
                version: "0.1.2.3",
                tallies: "012",
                xml: '<vmix><version>{version}</version><edition>Trial</edition><inputs><input key="44bcd391-0f5e-433f-8a45-d5960a973a75" number="1" type="Blank" title="Blank" shortTitle="Blank" state="Paused" position="0" duration="0" loop="False">Blank</input><input key="5c6147a9-398b-4013-969f-6b372b0be254" number="2" type="Blank" title="Blank" shortTitle="Blank" state="Paused" position="0" duration="0" loop="False">Blank</input></inputs><overlays><overlay number="1" /><overlay number="2" /><overlay number="3" /><overlay number="4" /><overlay number="5" /><overlay number="6" /></overlays><preview>1</preview><active>1</active><fadeToBlack>False</fadeToBlack><transitions><transition number="1" effect="VerticalSlide" duration="500" /><transition number="2" effect="Merge" duration="1000" /><transition number="3" effect="Wipe" duration="1000" /><transition number="4" effect="CubeZoom" duration="1000" /></transitions><recording>False</recording><external>False</external><streaming>False</streaming><playList>False</playList><multiCorder>False</multiCorder><fullscreen>False</fullscreen><audio><master volume="100" muted="False" meterF1="0" meterF2="0" headphonesVolume="100" /></audio></vmix>'
            }
            const server = Server((sck) => {
                sck.on('data', data => {
                    data = data.toString()
                    data.toString().replace(/[\r\n]*$/, "").split("\r\n").forEach(command => {
                        console.debug(`< ${command}`)
                        if(command === "XML") {
                            const response = global.vMixServerConfig.xml.replace("{version}", global.vMixServerConfig.version)
                            sck.write(Buffer.from(`'XML ${response.length}\r\n${response}\r\n`))
                        } else if(command === "SUBSCRIBE TALLY") {
                            sck.write(Buffer.from("SUBSCRIBE OK TALLY Subscribed\r\n", "utf-8"))
                            setTimeout(() => {
                                sck.writable && sck.write(Buffer.from(`TALLY OK ${global.vMixServerConfig.tallies}\r\n`, "utf-8"))
                            }, 100)
                        } else {
                            console.log(`vMix Mock received an unknown command: ${command}`)
                        }
                    })
                })
                sck.write(Buffer.from(`VERSION OK ${global.vMixServerConfig.version}\r\n`, "utf-8"))
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
                        global.vMixServerConfig.serverIp = server.address().address
                        global.vMixServerConfig.serverPort = server.address().port
                        resolve()
                    }
                })
            })

            global.vMixServerConfig.close = server.close.bind(server)

            return promise
        })
        afterEach(() => {
            if (global.vMixServerConfig) {
                return new Promise((resolve, reject) => {
                    global.vMixServerConfig.close((error) => {
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
        test('recognizes VERSION OK', async () => {
            const server = global.vMixServerConfig
            const [vmix] = createVmixCommunicator(server.serverIp, server.serverPort)
            try {
                expect(vmix.wasHelloReceived).toBe(false)
                vmix.connect()
                await waitUntil(() => vmix.wasHelloReceived === true).then(() =>
                    expect(vmix.wasHelloReceived).toBe(true)
                )
            } finally {
                await vmix.disconnect()
            }
        })
        test('recognizes SUBSCRIBE OK TALLY', async () => {
            const server = global.vMixServerConfig
            const [vmix] = createVmixCommunicator(server.serverIp, server.serverPort)
            try {
                expect(vmix.wasSubcribeOkReceived).toBe(false)
                vmix.connect()
                await waitUntil(() => vmix.wasSubcribeOkReceived === true).then(() =>
                    expect(vmix.wasSubcribeOkReceived).toBe(true)
                )
            } finally {
                await vmix.disconnect()
            }
        })
        test('parses TALLY OK command', async () => {
            const server = global.vMixServerConfig
            server.tallies = "012"
            const [vmix, communicator] = createVmixCommunicator(server.serverIp, server.serverPort)
            try {
                vmix.connect()
                await waitUntil(() => communicator.programs !== undefined).then(() => {
                    expect(communicator.programs).toEqual(["2"])
                    expect(communicator.previews).toEqual(["3"])
                })
            } finally {
                await vmix.disconnect()
            }
        })
        test('parses complex TALLY OK command', async () => {
            const server = global.vMixServerConfig
            server.tallies = "012210"
            const [vmix, communicator] = createVmixCommunicator(server.serverIp, server.serverPort)

            try {
                vmix.connect()
                await waitUntil(() => communicator.programs !== undefined).then(() => {
                    expect(communicator.programs).toEqual(["2", "5"])
                    expect(communicator.previews).toEqual(["3", "4"])
                })
            } finally {
                await vmix.disconnect()
            }
        })
        test('recognizes XML response', async () => {
            const server = global.vMixServerConfig
            server.xml = '<vmix><version>{version}</version><edition>Trial</edition><inputs><input key="0182ffa0-9fa9-4514-91af-37ef60240c87" number="1" type="Colour" title="Foobar" shortTitle="Foobar" state="Paused" position="0" duration="0" loop="False">Foobar</input><input key="a108d01e-26f4-466f-a37d-d8f91f3fd6eb" number="2" type="Colour" title="Tolle rote Farbe" shortTitle="Tolle rote Farbe" state="Paused" position="0" duration="0" loop="False">Tolle rote Farbe</input><input key="3f6e4c1b-a13f-46b0-9537-676a4fb17ea3" number="3" type="Colour" title="Colour Bars" shortTitle="Colour Bars" state="Paused" position="0" duration="0" loop="False">Colour Bars</input></inputs><overlays><overlay number="1" /><overlay number="2" /><overlay number="3" /><overlay number="4" /><overlay number="5" /><overlay number="6" /></overlays><preview>2</preview><active>3</active><fadeToBlack>False</fadeToBlack><transitions><transition number="1" effect="VerticalSlide" duration="500" /><transition number="2" effect="Merge" duration="1000" /><transition number="3" effect="Wipe" duration="1000" /><transition number="4" effect="CubeZoom" duration="1000" /></transitions><recording>False</recording><external>False</external><streaming>False</streaming><playList>False</playList><multiCorder>False</multiCorder><fullscreen>False</fullscreen><audio><master volume="100" muted="False" meterF1="0" meterF2="0" headphonesVolume="100" /></audio></vmix>'
            const [vmix, communicator] = createVmixCommunicator(server.serverIp, server.serverPort)
            try {
                vmix.connect()
                await waitUntil(() => communicator.channelCount !== undefined).then(() => {
                    expect(communicator.channelCount).toEqual(3)
                    expect(communicator.channelNames).toEqual({1: "Foobar", 2: "Tolle rote Farbe", 3: "Colour Bars"})
                })
            } finally {
                await vmix.disconnect()
            }
        })
    })
})
