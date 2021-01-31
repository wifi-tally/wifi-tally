import ObsConnector from './ObsConnector'
import WebSocket from 'ws'
import ObsConfiguration from './ObsConfiguration'

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

const defaultScene = {
    name: null,
    sources: [],
}

function createObsCommunicator(ip, port): [ObsConnector, MockCommunicator, ObsConfiguration] {
    const communicator = new MockCommunicator()
    const configuration = new ObsConfiguration()
    configuration.setIp(ip)
    configuration.setPort(port)
    const obs = new ObsConnector(configuration, communicator)

    return [obs, communicator, configuration]
}

describe('ObsConnector', () => {
    describe('onData', () => {
        beforeEach(() => {
            let socket = null
            let isTransitionRunning = false
            global.obsServer = {
                server: null,
                scenes: [],
                currentScene: null,
                previewScene: null,
                streaming: false,
                recording: false,
                cut: (newScene) => {
                    global.obsServer.currentScene = newScene
                    socket.send(JSON.stringify({
                        'update-type': "SwitchScenes",
                        'scene-name': newScene
                        // sources left out in mock
                    }))
                },
                transitionBegin: (newScene) => {
                    if (isTransitionRunning) {
                        // if a transition is already running, OBS just cuts to the new scene
                        global.obsServer.currentScene = newScene
                        socket.send(JSON.stringify({
                            'update-type': "TransitionBegin",
                            'to-scene': newScene,
                        }))
                        isTransitionRunning = false
                    } else {
                        socket.send(JSON.stringify({
                            'update-type': "TransitionBegin",
                            'from-scene': global.obsServer.currentScene,
                            'to-scene': newScene,
                        }))
                        isTransitionRunning = true
                    }
                },
                transitionEnd: (newScene) => {
                    // it also sends the SwitchScenes event
                    global.obsServer.cut(newScene)
                    global.obsServer.currentScene = newScene
                    socket.send(JSON.stringify({
                        'update-type': "TransitionEnd",
                        'to-scene': newScene,
                    }))
                    isTransitionRunning = false
                },
                preview: (scene) => {
                    global.obsServer.previewScene = scene
                    socket.send(JSON.stringify({
                        'update-type': "PreviewSceneChanged",
                        'scene-name': scene
                        // sources left out in mock
                    }))
                },
                enterStudioMode: (previewScene) => {
                    global.obsServer.previewScene = previewScene
                    socket.send(JSON.stringify({
                        'update-type': "StudioModeSwitched",
                        'new-state': true,
                    }))

                },
                exitStudioMode: () => {
                    global.obsServer.previewScene = null
                    socket.send(JSON.stringify({
                        'update-type': "StudioModeSwitched",
                        'new-stat': false,
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
                startStream: () => {
                    global.obsServer.streaming = true
                    socket.send(JSON.stringify({
                        'update-type': "StreamStarting",
                        'preview-only': false,
                    }))
                    socket.send(JSON.stringify({
                        'update-type': "StreamStarted",
                    }))
                },
                stopStream: () => {
                    global.obsServer.streaming = false
                    socket.send(JSON.stringify({
                        'update-type': "StreamStopping",
                        'preview-only': false,
                    }))
                    socket.send(JSON.stringify({
                        'update-type': "StreamStopped",
                    }))
                },
                startRecording: () => {
                    global.obsServer.recording = true
                    socket.send(JSON.stringify({
                        'update-type': "RecordingStarting",
                    }))
                    socket.send(JSON.stringify({
                        'update-type': "RecordingStarted",
                    }))
                },
                stopRecording: () => {
                    global.obsServer.recording = false
                    socket.send(JSON.stringify({
                        'update-type': "RecordingStopping",
                    }))
                    socket.send(JSON.stringify({
                        'update-type': "RecordingStopped",
                    }))
                },
                pauseRecording: () => {
                    global.obsServer.recording = false
                    socket.send(JSON.stringify({
                        'update-type': "RecordingPaused",
                    }))
                },
                unpauseRecording: () => {
                    global.obsServer.recording = true
                    socket.send(JSON.stringify({
                        'update-type': "RecordingResumed",
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
                                    status: "error",
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
            const server = global.obsServer
            const [obs, communicator] = createObsCommunicator(server.serverIp, server.serverPort)

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
                expect(communicator.previews).toEqual([])
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
            const server = global.obsServer
            const [obs, communicator] = createObsCommunicator(server.serverIp, server.serverPort)

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
            const server = global.obsServer
            const [obs, communicator] = createObsCommunicator(server.serverIp, server.serverPort)

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
            const server = global.obsServer
            const [obs, communicator] = createObsCommunicator(server.serverIp, server.serverPort)

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
            const server = global.obsServer
            const [obs, communicator] = createObsCommunicator(server.serverIp, server.serverPort)

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
        test('it does not crash when a transition is aborted', async () => {
            const server = global.obsServer
            const [obs, communicator] = createObsCommunicator(server.serverIp, server.serverPort)

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
                server.transitionBegin("Cam 1")
                await waitUntil(() => communicator.programs !== ["Cam 1", "Cam 2"])
                expect(communicator.programs).toEqual(["Cam 1"])
            } finally {
                await obs.disconnect()
            }
        })
        test('it handles modifications in the scenes', async () => {
            const server = global.obsServer
            const [obs, communicator] = createObsCommunicator(server.serverIp, server.serverPort)

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
            const server = global.obsServer
            const [obs, communicator] = createObsCommunicator(server.serverIp, server.serverPort)

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
            const server = global.obsServer
            const [obs, communicator] = createObsCommunicator(server.serverIp, server.serverPort)

            server.scenes = [
                { name: "Scene 1" },
                { name: "Scene 2" },
            ]
            server.currentScene = "Scene 1"

            try {
                obs.connect()
                await waitUntil(() => obs.isConnected())
                expect(communicator.programs).toEqual(["Scene 1"])
                expect(communicator.previews).toEqual([])

                server.enterStudioMode("Scene 2")
                await waitUntil(() => communicator.previews !== null)
                expect(communicator.previews).toEqual(["Scene 2"])

                server.exitStudioMode()
                await waitUntil(() => communicator.previews !== ["Scene 2"])
                expect(communicator.previews).toEqual([])
            } finally {
                await obs.disconnect()
            }
        })

        describe("liveMode", () => {
            test('"stream" only shows a program status when streaming', async () => {
                const server = global.obsServer
                const [obs, communicator, configuration] = createObsCommunicator(server.serverIp, server.serverPort)
                configuration.setLiveMode("stream")
    
                server.scenes = [
                    { name: "Scene 1" },
                    { name: "Scene 2" },
                ]
                server.currentScene = "Scene 1"
                server.previewScene = "Scene 2"
    
                try {
                    obs.connect()
                    await waitUntil(() => obs.isConnected())
                    expect(obs.isConnected()).toEqual(true)
                    expect(communicator.isConnected).toBe(true)
                    expect(communicator.programs).toEqual([])
                    expect(communicator.previews).toEqual(["Scene 1"])

                    server.startStream()
                    await waitUntil(() => communicator.previews !== [])
                    expect(communicator.isConnected).toBe(true)
                    expect(communicator.programs).toEqual(["Scene 1"])
                    expect(communicator.previews).toEqual(["Scene 2"])

                    server.stopStream()
                    await waitUntil(() => communicator.previews !== ["Scene 1"])
                    expect(communicator.isConnected).toBe(true)
                    expect(communicator.programs).toEqual([])
                    expect(communicator.previews).toEqual(["Scene 1"])
                } finally {
                    await obs.disconnect()
                }
            })
            test('"record" only shows a program status when recording', async () => {
                const server = global.obsServer
                const [obs, communicator, configuration] = createObsCommunicator(server.serverIp, server.serverPort)
                configuration.setLiveMode("record")
    
                server.scenes = [
                    { name: "Scene 1" },
                    { name: "Scene 2" },
                ]
                server.currentScene = "Scene 1"
                server.previewScene = "Scene 2"
    
                try {
                    obs.connect()
                    await waitUntil(() => obs.isConnected())
                    expect(obs.isConnected()).toEqual(true)
                    expect(communicator.isConnected).toBe(true)
                    expect(communicator.programs).toEqual([])
                    expect(communicator.previews).toEqual(["Scene 1"])

                    server.startRecording()
                    await waitUntil(() => communicator.previews !== [])
                    expect(communicator.isConnected).toBe(true)
                    expect(communicator.programs).toEqual(["Scene 1"])
                    expect(communicator.previews).toEqual(["Scene 2"])

                    server.pauseRecording()
                    await waitUntil(() => communicator.previews !== ["Scene 1"])
                    expect(communicator.isConnected).toBe(true)
                    expect(communicator.programs).toEqual([])
                    expect(communicator.previews).toEqual(["Scene 1"])

                    server.unpauseRecording()
                    await waitUntil(() => communicator.previews !== [])
                    expect(communicator.isConnected).toBe(true)
                    expect(communicator.programs).toEqual(["Scene 1"])
                    expect(communicator.previews).toEqual(["Scene 2"])

                    server.stopRecording()
                    await waitUntil(() => communicator.previews !== ["Scene 1"])
                    expect(communicator.isConnected).toBe(true)
                    expect(communicator.programs).toEqual([])
                    expect(communicator.previews).toEqual(["Scene 1"])
                } finally {
                    await obs.disconnect()
                }
            })
            test('"streamOrRecord" only shows a program status when streaming or recording', async () => {
                const server = global.obsServer
                const [obs, communicator, configuration] = createObsCommunicator(server.serverIp, server.serverPort)
                configuration.setLiveMode("streamOrRecord")
    
                server.scenes = [
                    { name: "Scene 1" },
                    { name: "Scene 2" },
                ]
                server.currentScene = "Scene 1"
                server.previewScene = "Scene 2"
    
                try {
                    obs.connect()
                    await waitUntil(() => obs.isConnected())
                    expect(obs.isConnected()).toEqual(true)
                    expect(communicator.isConnected).toBe(true)
                    expect(communicator.programs).toEqual([])
                    expect(communicator.previews).toEqual(["Scene 1"])

                    server.startRecording()
                    await waitUntil(() => communicator.previews !== [])
                    expect(communicator.isConnected).toBe(true)
                    expect(communicator.programs).toEqual(["Scene 1"])
                    expect(communicator.previews).toEqual(["Scene 2"])

                    server.stopRecording()
                    await waitUntil(() => communicator.previews !== ["Scene 1"])
                    expect(communicator.isConnected).toBe(true)
                    expect(communicator.programs).toEqual([])
                    expect(communicator.previews).toEqual(["Scene 1"])

                    server.startStream()
                    await waitUntil(() => communicator.previews !== [])
                    expect(communicator.isConnected).toBe(true)
                    expect(communicator.programs).toEqual(["Scene 1"])
                    expect(communicator.previews).toEqual(["Scene 2"])

                    server.stopStream()
                    await waitUntil(() => communicator.previews !== ["Scene 1"])
                    expect(communicator.isConnected).toBe(true)
                    expect(communicator.programs).toEqual([])
                    expect(communicator.previews).toEqual(["Scene 1"])
                } finally {
                    await obs.disconnect()
                }
            })
        })
        
    })
})
