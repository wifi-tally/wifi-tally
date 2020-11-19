const ObsConnector = require('./ObsConnector')
const WebSocket = require('ws')
const EventEmitter = require('events')

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
        this.channels
        this.programs
        this.previews
    }

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

const defaultScene = {
    name: null,
    sources: [],
}

describe('ObsConnector', () => {
    describe('onData', () => {
        beforeEach(() => {
            let socket = null
            global.obsServer = {
                server: null,
                scenes: [],
                currentScene: null,
                previewScene: null,
                cut: (newScene) => {
                    global.obsServer.currentScene = newScene
                    socket.send(JSON.stringify({
                        'update-type': "SwitchScenes",
                        sceneName: newScene
                        // sources left out in mock
                    }))
                },
                transitionBegin: (newScene) => {
                    socket.send(JSON.stringify({
                        'update-type': "TransitionBegin",
                        fromScene: global.obsServer.currentScene,
                        toScene: newScene,
                    }))
                },
                transitionEnd: (newScene) => {
                    // it also sends the SwitchScenes event
                    global.obsServer.cut(newScene)
                    global.obsServer.currentScene = newScene
                    socket.send(JSON.stringify({
                        'update-type': "TransitionEnd",
                        toScene: newScene,
                    }))
                },
                preview: (scene) => {
                    global.obsServer.previewScene = scene
                    socket.send(JSON.stringify({
                        'update-type': "PreviewSceneChanged",
                        sceneName: scene
                        // sources left out in mock
                    }))
                },
                enterStudioMode: (previewScene) => {
                    global.obsServer.previewScene = previewScene
                    socket.send(JSON.stringify({
                        'update-type': "StudioModeSwitched",
                        newState: true,
                    }))

                },
                exitStudioMode: () => {
                    global.obsServer.previewScene = null
                    socket.send(JSON.stringify({
                        'update-type': "StudioModeSwitched",
                        newState: false,
                    }))

                },
                changeScenes: (newScenes) => {
                    global.obsServer.scenes = newScenes
                    socket.send(JSON.stringify({
                        'update-type': "ScenesChanged",
                    }))
                },
                changeSceneCollection: (newScenes, newScene) => {
                    // !!!IMPORTANT!!! OBS cuts to the new scene before giving hint that scenes have changed
                    global.obsServer.cut(newScene)
                    global.obsServer.scenes = newScenes
                    socket.send(JSON.stringify({
                        'update-type': "SceneCollectionChanged",
                    }))
                },
                onMessageReceive: (data) => {
                    const requestType = data['request-type']
                    // console.log(data, requestType)
                    switch (requestType) {
                        case "GetAuthRequired":
                            return {
                                authRequired: false,
                            }
                        case "GetSceneList":
                            return {
                                'current-scene': global.obsServer.currentScene,
                                scenes: global.obsServer.scenes.map(scene => Object.assign({}, defaultScene, scene)),
                            }
                        case "GetPreviewScene":
                            if (global.obsServer.previewScene) {
                                return {
                                    name: global.obsServer.previewScene,
                                    // sources left out in mock
                                }
                            } else {
                                return {
                                    error: "studio mode not enabled",
                                    messageId: 2,
                                }
                            }
                        default: 
                            throw `Request "${requestType}" not implemented in mock.`
                    }
                }
            }

            return new Promise((resolve, reject) => {
                global.obsServer.server = new WebSocket.Server({port: 0}, err => {
                    if (err) { 
                        reject(err)
                    } else {
                        global.obsServer.serverIp = "localhost"
                        global.obsServer.serverPort = global.obsServer.server.address()["port"]
                        resolve()
                    }
                })
                global.obsServer.server.on('connection', sck => {
                    socket = sck
                    sck.on('message', msg => {
                        const requestData = JSON.parse(msg)
                        const messageId = requestData['message-id']

                        const response = global.obsServer.onMessageReceive(requestData)
                        const responseData = response || {}
                        responseData['message-id'] = messageId
                        responseData.status = responseData.status || 'ok'

                        sck.send(JSON.stringify(responseData))
                    })
                })
            })
        })
        afterEach(() => {
            if (global.obsServer.server) {
                return new Promise((resolve, reject) => {
                    global.obsServer.server.close((error) => {
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
        test('it correctly determines the initial state without studio mode', async () => {
            const communicator = new MockCommunicator()
            const server = global.obsServer
            const obs = new ObsConnector(server.serverIp, server.serverPort, communicator)

            server.scenes = [
                { name: "Scene 1" },
                { name: "Scene 2" },
            ]
            server.currentScene = "Scene 1"

            try {
                obs.connect()
                await waitUntil(() => obs.isConnected())
                expect(obs.isConnected()).toEqual(true)
                expect(communicator.isConnected).toBe(true)
                expect(communicator.programs).toEqual(["Scene 1"])
                expect(communicator.previews).toBe(null)
                expect(communicator.channels[0].name).toEqual("Scene 1")
                expect(communicator.channels[1].name).toEqual("Scene 2")

                server.cut("Scene 2")
                await waitUntil(() => communicator.programs !== ["Scene 1"])
                expect(communicator.programs).toEqual(["Scene 2"])
            } finally {
                await obs.disconnect()
            }
        })
        test('it correctly determines the initial state with studio mode', async () => {
            const communicator = new MockCommunicator()
            const server = global.obsServer
            const obs = new ObsConnector(server.serverIp, server.serverPort, communicator)

            server.scenes = [
                { name: "Scene 1" },
                { name: "Scene 2" },
                { name: "Scene 3" },
            ]
            server.currentScene = "Scene 1"
            server.previewScene = "Scene 2"

            try {
                obs.connect()
                await waitUntil(() => obs.isConnected())
                expect(obs.isConnected()).toEqual(true)
                expect(communicator.isConnected).toBe(true)
                expect(communicator.programs).toEqual(["Scene 1"])
                expect(communicator.previews).toEqual(["Scene 2"])

                server.preview("Scene 3")
                await waitUntil(() => communicator.previews !== ["Scene 2"])
                expect(communicator.previews).toEqual(["Scene 3"])
            } finally {
                await obs.disconnect()
            }
        })
        test('it cuts', async () => {
            const communicator = new MockCommunicator()
            const server = global.obsServer
            const obs = new ObsConnector(server.serverIp, server.serverPort, communicator)

            server.scenes = [
                { name: "Scene 1" },
                { name: "Scene 2" },
            ]
            server.currentScene = "Scene 1"

            try {
                obs.connect()
                await waitUntil(() => obs.isConnected())
                expect(communicator.programs).toEqual(["Scene 1"])

                server.cut("Scene 2")
                await waitUntil(() => communicator.programs !== ["Scene 1"])
                expect(communicator.programs).toEqual(["Scene 2"])
            } finally {
                await obs.disconnect()
            }
        })
        test('it handles scenes inside scenes', async () => {
            const communicator = new MockCommunicator()
            const server = global.obsServer
            const obs = new ObsConnector(server.serverIp, server.serverPort, communicator)

            server.scenes = [
                { name: "Cam 1" },
                { name: "Cam 2" },
                { name: "Picture In Picture", sources: [
                    {
                        name: "Cam 1",
                        type: "scene",
                    },
                    {
                        name: "Cam 2",
                        type: "scene",
                    }
                ] },
            ]
            server.currentScene = "Cam 1"

            try {
                obs.connect()
                await waitUntil(() => obs.isConnected())
                expect(communicator.programs).toEqual(["Cam 1"])

                server.cut("Cam 2")
                await waitUntil(() => communicator.programs !== ["Cam 1"])
                expect(communicator.programs).toEqual(["Cam 2"])

                server.cut("Picture In Picture")
                await waitUntil(() => communicator.programs !== ["Cam 2"])
                expect(communicator.programs).toEqual(["Picture In Picture", "Cam 1", "Cam 2"])
            } finally {
                await obs.disconnect()
            }
        })
        test('it handles transitions', async () => {
            const communicator = new MockCommunicator()
            const server = global.obsServer
            const obs = new ObsConnector(server.serverIp, server.serverPort, communicator)

            server.scenes = [
                { name: "Cam 1" },
                { name: "Cam 2" },
            ]
            server.currentScene = "Cam 1"

            try {
                obs.connect()
                await waitUntil(() => obs.isConnected())
                expect(communicator.programs).toEqual(["Cam 1"])

                server.transitionBegin("Cam 2")
                await waitUntil(() => communicator.programs !== ["Cam 1"])
                expect(communicator.programs).toEqual(["Cam 1", "Cam 2"])

                
                server.transitionEnd("Cam 2")
                await waitUntil(() => communicator.programs !== ["Cam 1", "Cam 2"])
                expect(communicator.programs).toEqual(["Cam 2"])
            } finally {
                await obs.disconnect()
            }
        })
        test('it handles modifications in the scenes', async () => {
            const communicator = new MockCommunicator()
            const server = global.obsServer
            const obs = new ObsConnector(server.serverIp, server.serverPort, communicator)

            server.scenes = [
                { name: "Scene 1" },
                { name: "Scene 2" },
            ]
            server.currentScene = "Scene 1"

            try {
                obs.connect()
                await waitUntil(() => obs.isConnected())
                expect(communicator.channels[0].name).toEqual("Scene 1")
                expect(communicator.channels[1].name).toEqual("Scene 2")

                server.changeScenes([
                    { name: "Scene 1" },
                    { name: "Scene 2" },
                    { name: "Scene 3" },
                ])
                await waitUntil(() => communicator.channels.length !== 2)
                
                expect(communicator.channels[0].name).toEqual("Scene 1")
                expect(communicator.channels[1].name).toEqual("Scene 2")
                expect(communicator.channels[2].name).toEqual("Scene 3")
            } finally {
                await obs.disconnect()
            }
        })
        test('it handles changing the scene collection', async () => {
            const communicator = new MockCommunicator()
            const server = global.obsServer
            const obs = new ObsConnector(server.serverIp, server.serverPort, communicator)

            server.scenes = [
                { name: "Collection 1 / Scene 1" },
                { name: "Collection 1 / Scene 2" },
            ]
            server.currentScene = "Collection 1 / Scene 1"

            try {
                obs.connect()
                await waitUntil(() => obs.isConnected())
                expect(communicator.channels[0].name).toEqual("Collection 1 / Scene 1")
                expect(communicator.channels[1].name).toEqual("Collection 1 / Scene 2")

                server.changeSceneCollection([
                    { name: "Collection 2 / Scene 1" },
                    { name: "Collection 2 / Scene 2" },
                    { name: "Collection 2 / Scene 3" },
                ], "Collection 2 / Scene 3")
                await waitUntil(() => communicator.channels.length !== 2)
                
                expect(communicator.channels[0].name).toEqual("Collection 2 / Scene 1")
                expect(communicator.channels[1].name).toEqual("Collection 2 / Scene 2")
                expect(communicator.channels[2].name).toEqual("Collection 2 / Scene 3")
            } finally {
                await obs.disconnect()
            }
        })
        test('it correctly switches preview when changing in and out of studio mode', async () => {
            const communicator = new MockCommunicator()
            const server = global.obsServer
            const obs = new ObsConnector(server.serverIp, server.serverPort, communicator)

            server.scenes = [
                { name: "Scene 1" },
                { name: "Scene 2" },
            ]
            server.currentScene = "Scene 1"

            try {
                obs.connect()
                await waitUntil(() => obs.isConnected())
                expect(communicator.programs).toEqual(["Scene 1"])
                expect(communicator.previews).toEqual(null)

                server.enterStudioMode("Scene 2")
                await waitUntil(() => communicator.previews !== null)
                expect(communicator.previews).toEqual(["Scene 2"])

                server.exitStudioMode()
                await waitUntil(() => communicator.previews !== ["Scene 2"])
                expect(communicator.previews).toEqual(null)
            } finally {
                await obs.disconnect()
            }
        })
    })
})
