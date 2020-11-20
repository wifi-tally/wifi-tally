const OBSWebSocket = require('obs-websocket-js')
const {Channel} = require('../domain/Channel')

const reconnectTimeoutMs = 1000

// uses obs-websockets
// @see https://github.com/Palakis/obs-websocket
class ObsConnector {
    constructor(ip, port, communicator) {
        this.ip = ip
        this.port = port
        this.communicator = communicator
        // tracks which scenes are embedded into other scenes
        this.embeddedScenes = {}
        this.reconnectTimeout = null
    }
    connect() {
        this.obs = new OBSWebSocket()
        this.obs.on('error', err => {
            console.error("obs socket error:", err)
        })
        this.obs.on('SwitchScenes', data => {
            // console.debug('SwitchScenes', data)
            this._notifyProgramChanged([data.sceneName])
        })
        this.obs.on('ScenesChanged', data => {
            // console.debug('ScenesChanged', data)
            this._updateScenes()
        })
        this.obs.on('SceneCollectionChanged', data => {
            // console.debug('SceneCollectionChanged', data)
            this._updateScenes()
        })
        this.obs.on('SceneCollectionListChanged', data => {
            // console.debug('SceneCollectionListChanged', data)
            this._updateScenes()
        })
        this.obs.on('TransitionBegin', data => {
            // console.debug('TransitionBegin', data)
            // "filter" removes non-truthy values
            this._notifyProgramChanged([data.fromScene, data.toScene].filter(scene => scene))
        })
        this.obs.on('TransitionEnd', data => {
            // console.debug('TransitionEnd', data)
            this._notifyProgramChanged([data.toScene])
        })
        this.obs.on('PreviewSceneChanged', data => {
            // console.debug('PreviewSceneChanged', data)
            this._notifyPreviewChanged([data.sceneName])
        })
        this.obs.on('StudioModeSwitched', data => {
            // console.debug('StudioModeSwitched', data)
            if (data.newState) {
                // if: switched INTO studio mode
                this._updatePreviewScene()
            } else {
                // if: switched OUT OF studio mode
                this.communicator.notifyPreviewChanged(null)
            }
        })

        const connect = () => {
            if (this.reconnectTimeout) { 
                clearTimeout(this.reconnectTimeout)
            }
            console.log(`Connecting to OBS at ${this.ip}:${this.port}`)
            this.obs.connect({address: `${this.ip}:${this.port}`}).then(() => {
                this.communicator.notifyMixerIsConnected()
                this._updateScenes()
                this._updatePreviewScene()
                console.log("Connected to OBS")

                this.obs.on('ConnectionClosed', () => {
                    this.obs.removeAllListeners('ConnectionClosed')
                    console.error("Connection to OBS lost")
                    this.reconnectTimeout = setTimeout(connect, reconnectTimeoutMs)
                })
            }).catch(err => {
                this.communicator.notifyMixerIsDisconnected()
                console.error("error when connecting to OBS:", err.error)
                this.reconnectTimeout = setTimeout(connect, reconnectTimeoutMs)
            })
        }

        connect()

        this.communicator.notifyProgramPreviewChanged(null, null)
    }
    _updatePreviewScene() {
        this.obs.send("GetPreviewScene").then(data => {
            // console.debug("GetPreviewScene", data)
            this._notifyPreviewChanged([data.name])
        }).catch(err => {
            // if studio mode is disabled we get an error and fail gracefully
        })
    }
    _updateScenes() {
        this.obs.send("GetSceneList").then(data => {
            // console.debug("GetSceneList", data)

            this._updateEmbeddedScenes(data.scenes)
            this.communicator.notifyChannels(data.scenes.map(scene => new Channel(scene.name, scene.name)))

            if (data.currentScene) {
                this._notifyProgramChanged([data.currentScene])
            }
        }).catch(err => {
            console.error(err)
            // @TODO
        })
    }
    // update the information which scenes are embedded into other scenes - so they can also get the right state
    _updateEmbeddedScenes(scenes) {
        this.embeddedScenes = {}
        scenes.forEach(scene => {
            this.embeddedScenes[scene.name] = scene.sources.filter(source => source.type === "scene").map(source => source.name)
        })
    }
    _notifyProgramChanged(scenes) {
        const programs = []
        scenes.forEach(scene => {
            programs.push(scene)
            programs.push(...(this.embeddedScenes[scene] || []))
        })

        this.communicator.notifyProgramChanged(programs)
    }
    _notifyPreviewChanged(scenes) {
        const previews = []
        scenes.forEach(scene => {
            previews.push(scene)
            previews.push(...(this.embeddedScenes[scene] || []))
        })

        this.communicator.notifyPreviewChanged(previews)
    }

    disconnect() {
        if (this.reconnectTimeout) { 
            clearTimeout(this.reconnectTimeout)
        }
        if (this.obs) {
            this.obs.removeAllListeners('ConnectionClosed')
            this.obs.disconnect()
        }
    }

    isConnected() {
        // @TODO
        return this.obs && this.obs._connected
    }
}

ObsConnector.ID = "obs"
ObsConnector.defaultIp = "127.0.0.1"
ObsConnector.defaultPort = 4444

module.exports = ObsConnector;