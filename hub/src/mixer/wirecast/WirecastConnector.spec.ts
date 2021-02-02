import WirecastConnector, { WirecastStatus } from './WirecastConnector'
import { Server, Socket } from 'net'
import WirecastConfiguration from './WirecastConfiguration'

const waitUntil = (fn) => {
    return new Promise((resolve, _) => {
        setInterval(() => {
            if (fn() === true) {
                resolve(null)
            }
        }, 100)
    })
}

class MockCommunicator {
    programs = null
    previews = null
    channels = null
    isConnected = false

    notifyProgramPreviewChanged(programs, previews) {
        this.programs = programs
        this.previews = previews
    }

    notifyProgramChanged(programs) {
        this.programs = programs
    }

    notifyPreviewChanged(previews) {
        this.previews = previews
    }

    notifyChannels(channels) {
        this.channels = channels
    }

    notifyMixerIsConnected() {
        this.isConnected = true
    }

    notifyMixerIsDisconnected() {
        this.isConnected = false
    }
}

describe('WirecastConnector', () => {
    describe('onData', () => {

        var mockData
        const setMockData = (data: object) => {
            var theData: string
            if (typeof data !== "string") {
                theData = JSON.stringify(data)
            } else {
                theData = data
            }
            mockData = theData

            if(currentSocket && !currentSocket.destroyed) {
                currentSocket.write(Buffer.from(`${mockData}\n`, "utf-8"))
            }
        }
        var server: Server
        var serverIp: string
        var serverPort: number
        var currentSocket: Socket

        beforeEach(() => {
            server = new Server((sck) => {
                currentSocket = sck
                if (mockData) {
                    sck.write(Buffer.from(`${mockData}\n`, "utf-8"))
                }
            })

            return new Promise((resolve, reject) => {
                server.listen({
                    port: 0,
                    host: 'localhost',
                }, () => {
                    serverIp = server.address().address
                    serverPort = server.address().port
                    resolve(server)
                })
            })
        })
        afterEach(() => {
            if (server) {
                return new Promise((resolve, reject) => {
                    server.close((error) => {
                        if (error) {
                            console.error(error)
                            reject(error)
                        } else {
                            resolve(null)
                        }
                    })
                })
            }
            server = null;
            currentSocket = null;
            serverIp = null;
            serverPort = null;
        })


        function createWirecastCommunicator(): [WirecastConnector, MockCommunicator, WirecastConfiguration] {
            const communicator = new MockCommunicator()
            const configuration = new WirecastConfiguration()
            configuration.setIp(serverIp)
            configuration.setPort(serverPort)
            const wirecast = new WirecastConnector(configuration, communicator)

            return [wirecast, communicator, configuration]
        }

        test('it correctly determines channel names, previews and programs', async () => {
            const [wc, communicator] = createWirecastCommunicator()

            const data: WirecastStatus = {
                shots: [
                    {
                        name: "One",
                        id: 42,
                        layerIdx: 2,
                        shotIdx: 2,
                    },
                    {
                        name: "Two",
                        id: 43,
                        layerIdx: 3,
                        shotIdx: 2,
                    },
                    {
                        name: "Three",
                        id: 44,
                        layerIdx: 3,
                        shotIdx: 3,
                    }
                ],
                previews: [42, 44],
                lives: [42, 43],
                isRecording: false,
                isBroadcasting: false,
                isConnected: true,
            }
            setMockData(data)

            try {
                wc.connect()
                await waitUntil(() => wc.isConnected())
                expect(wc.isConnected()).toEqual(true)
                expect(communicator.isConnected).toBe(true)
                expect(communicator.programs).toEqual(["42", "43"])
                expect(communicator.previews).toEqual(["42", "44"])
                expect(communicator.channels[0].name).toEqual("One")
                expect(communicator.channels[1].name).toEqual("Two")

                data.previews = [42]
                data.lives = [42, 44]
                setMockData(data)

                await waitUntil(() => communicator.programs[1] !== "43")
                expect(communicator.programs).toEqual(["42", "44"])
                expect(communicator.previews).toEqual(["42"])
                


            } finally {
                await wc.disconnect()
            }
        })

        describe("liveMode", () => {
            test('"stream" only shows a program status when streaming', async () => {
                const [wc, communicator, configuration] = createWirecastCommunicator()
                configuration.setLiveMode("stream")

                const data: WirecastStatus = {
                    shots: [
                        {
                            name: "One",
                            id: 42,
                            layerIdx: 2,
                            shotIdx: 2,
                        },
                        {
                            name: "Two",
                            id: 43,
                            layerIdx: 3,
                            shotIdx: 2,
                        },
                        {
                            name: "Three",
                            id: 44,
                            layerIdx: 3,
                            shotIdx: 3,
                        }
                    ],
                    previews: [42, 44],
                    lives: [42, 43],
                    isRecording: false,
                    isBroadcasting: false,
                    isConnected: true,
                }
                setMockData(data)

                try {
                    wc.connect()
                    await waitUntil(() => wc.isConnected())
                    expect(wc.isConnected()).toEqual(true)
                    expect(communicator.isConnected).toBe(true)
                    // not broadcasting
                    expect(communicator.programs).toEqual([])
                    expect(communicator.previews).toEqual(["42", "43"])

                    data.isBroadcasting = true
                    setMockData(data)

                    await waitUntil(() => communicator.programs !== [])
                    expect(communicator.programs).toEqual(["42", "43"])
                    expect(communicator.previews).toEqual(["42", "44"])
                } finally {
                    await wc.disconnect()
                }
            })
            test('"record" only shows a program status when recording', async () => {
                const [wc, communicator, configuration] = createWirecastCommunicator()
                configuration.setLiveMode("record")

                const data: WirecastStatus = {
                    shots: [
                        {
                            name: "One",
                            id: 42,
                            layerIdx: 2,
                            shotIdx: 2,
                        },
                        {
                            name: "Two",
                            id: 43,
                            layerIdx: 3,
                            shotIdx: 2,
                        },
                        {
                            name: "Three",
                            id: 44,
                            layerIdx: 3,
                            shotIdx: 3,
                        }
                    ],
                    previews: [42, 44],
                    lives: [42, 43],
                    isRecording: false,
                    isBroadcasting: false,
                    isConnected: true,
                }
                setMockData(data)

                try {
                    wc.connect()
                    await waitUntil(() => wc.isConnected())
                    expect(wc.isConnected()).toEqual(true)
                    expect(communicator.isConnected).toBe(true)
                    // not broadcasting
                    expect(communicator.programs).toEqual([])
                    expect(communicator.previews).toEqual(["42", "43"])

                    data.isRecording = true
                    setMockData(data)

                    await waitUntil(() => communicator.programs !== [])
                    expect(communicator.programs).toEqual(["42", "43"])
                    expect(communicator.previews).toEqual(["42", "44"])
                } finally {
                    await wc.disconnect()
                }
            })
            
            test('"streamOrRecord" only shows a program status when streaming or recording', async () => {
                const [wc, communicator, configuration] = createWirecastCommunicator()
                configuration.setLiveMode("streamOrRecord")

                const data: WirecastStatus = {
                    shots: [
                        {
                            name: "One",
                            id: 42,
                            layerIdx: 2,
                            shotIdx: 2,
                        },
                        {
                            name: "Two",
                            id: 43,
                            layerIdx: 3,
                            shotIdx: 2,
                        },
                        {
                            name: "Three",
                            id: 44,
                            layerIdx: 3,
                            shotIdx: 3,
                        }
                    ],
                    previews: [42, 44],
                    lives: [42, 43],
                    isRecording: false,
                    isBroadcasting: false,
                    isConnected: true,
                }
                setMockData(data)

                try {
                    wc.connect()
                    await waitUntil(() => wc.isConnected())
                    expect(wc.isConnected()).toEqual(true)
                    expect(communicator.isConnected).toBe(true)
                    // not broadcasting
                    expect(communicator.programs).toEqual([])
                    expect(communicator.previews).toEqual(["42", "43"])

                    // recording
                    data.isRecording = true
                    setMockData(data)
                    await waitUntil(() => communicator.programs !== [])
                    expect(communicator.programs).toEqual(["42", "43"])
                    expect(communicator.previews).toEqual(["42", "44"])

                    data.isRecording = false
                    setMockData(data)
                    await waitUntil(() => communicator.programs[0] !== "42")
                    expect(communicator.programs).toEqual([])
                    expect(communicator.previews).toEqual(["42", "43"])

                    // broadcasting
                    data.isBroadcasting = true
                    setMockData(data)
                    await waitUntil(() => communicator.programs !== [])
                    expect(communicator.programs).toEqual(["42", "43"])
                    expect(communicator.previews).toEqual(["42", "44"])
                } finally {
                    await wc.disconnect()
                }
            })
        })
        test('"layers" filters channels', async () => {
            const [wc, communicator, configuration] = createWirecastCommunicator()
            configuration.setLayers([4, 2])

            const data: WirecastStatus = {
                shots: [
                    {
                        name: "One",
                        id: 42,
                        layerIdx: 2,
                        shotIdx: 2,
                    },
                    {
                        name: "Two",
                        id: 43,
                        layerIdx: 3,
                        shotIdx: 2,
                    },
                    {
                        name: "Three",
                        id: 44,
                        layerIdx: 3,
                        shotIdx: 3,
                    }
                ],
                previews: [42, 44],
                lives: [42, 43],
                isRecording: false,
                isBroadcasting: false,
                isConnected: true,
            }
            setMockData(data)

            try {
                wc.connect()
                await waitUntil(() => wc.isConnected())
                expect(wc.isConnected()).toEqual(true)
                expect(communicator.isConnected).toBe(true)
                expect(communicator.programs).toEqual(["42", "43"])
                expect(communicator.previews).toEqual(["42", "44"])
                expect(communicator.channels[0].name).toEqual("One")
                expect(communicator.channels).toHaveLength(1)
            } finally {
                await wc.disconnect()
            }
        })
    })
})
