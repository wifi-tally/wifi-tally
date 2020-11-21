import OBSWebSocket from 'obs-websocket-js'
import Channel from '../../domain/Channel'
import { MixerCommunicator } from '../../lib/MixerCommunicator'
import { Connector } from '../interfaces'

const reconnectTimeoutMs = 1000

// uses obs-websockets
// @see https://github.com/Palakis/obs-websocket
class ObsConnector implements Connector{
    ip: string
    port: number
    communicator: MixerCommunicator
    embeddedScenes: {}
    reconnectTimeout: NodeJS.Timeout | null
    obs: OBSWebSocket | null
    connected: boolean
    
    constructor(ip: string, port: number, communicator: MixerCommunicator) {
        this.ip = ip
        this.port = port
        this.communicator = communicator
        // tracks which scenes are embedded into other scenes
        this.embeddedScenes = {}
        this.reconnectTimeout = null
        this.connected = false
    }
    connect() {
        this.obs = new OBSWebSocket()
        // @ts-ignore https://github.com/haganbmj/obs-websocket-js/issues/203
        this.obs.on('error', err => {
            console.error("obs socket error:", err)
        })
        this.obs.on('SwitchScenes', data => {
            // console.debug('SwitchScenes', data)
            this.notifyProgramChanged([data["scene-name"]])
        })
        this.obs.on('ScenesChanged', data => {
            // console.debug('ScenesChanged', data)
            this.updateScenes()
        })
        this.obs.on('SceneCollectionChanged', data => {
            // console.debug('SceneCollectionChanged', data)
            this.updateScenes()
        })
        this.obs.on('SceneCollectionListChanged', data => {
            // console.debug('SceneCollectionListChanged', data)
            this.updateScenes()
        })
        this.obs.on('TransitionBegin', data => {
            // console.debug('TransitionBegin', data)
            this.notifyProgramChanged([data["from-scene"], data["to-scene"]].filter(scene => scene /* remove non-truthy values */))
        })
        this.obs.on('TransitionEnd', data => {
            // console.debug('TransitionEnd', data)
            this.notifyProgramChanged([data["to-scene"]])
        })
        this.obs.on('PreviewSceneChanged', data => {
            // console.debug('PreviewSceneChanged', data)
            this.notifyPreviewChanged([data["scene-name"]])
        })
        this.obs.on('StudioModeSwitched', data => {
            // console.debug('StudioModeSwitched', data)
            if (data["new-state"]) {
                // if: switched INTO studio mode
                this.updatePreviewScene()
            } else {
                // if: switched OUT OF studio mode
                this.communicator.notifyPreviewChanged(null)
            }
        })

        const connect = () => {
            if (!this.obs) { return }
            if (this.reconnectTimeout) { 
                clearTimeout(this.reconnectTimeout)
            }
            console.log(`Connecting to OBS at ${this.ip}:${this.port}`)
            this.obs.connect({address: `${this.ip}:${this.port}`}).then(() => {
                this.connected = true
                this.communicator.notifyMixerIsConnected()
                this.updateScenes()
                this.updatePreviewScene()
                console.log("Connected to OBS")

                this.obs?.on('ConnectionClosed', () => {
                    this.connected = false
                    this.communicator.notifyMixerIsDisconnected()
                    this.obs?.removeAllListeners('ConnectionClosed')
                    console.error("Connection to OBS lost")
                    this.reconnectTimeout = setTimeout(connect, reconnectTimeoutMs)
                })
            }).catch(err => {
                this.connected = false
                this.communicator.notifyMixerIsDisconnected()
                console.error("error when connecting to OBS:", err.error)
                this.reconnectTimeout = setTimeout(connect, reconnectTimeoutMs)
            })
        }

        connect()

        this.communicator.notifyProgramPreviewChanged(null, null)
    }
    private updatePreviewScene() {
        this.obs?.send("GetPreviewScene").then(data => {
            // console.debug("GetPreviewScene", data)
            this.notifyPreviewChanged([data.name])
        }).catch(err => {
            // if studio mode is disabled we get an error and fail gracefully
        })
    }
    private updateScenes() {
        this.obs?.send("GetSceneList").then(data => {
            // console.debug("GetSceneList", data)

            this.updateEmbeddedScenes(data.scenes)
            this.communicator.notifyChannels(data.scenes.map(scene => new Channel(scene.name, scene.name)))

            if (data["current-scene"]) {
                this.notifyProgramChanged([data["current-scene"]])
            }
        }).catch(err => {
            console.error(err)
            // @TODO
        })
    }
    // update the information which scenes are embedded into other scenes - so they can also get the right state
    private updateEmbeddedScenes(scenes: OBSWebSocket.Scene[]) {
        this.embeddedScenes = {}
        scenes.forEach(scene => {
            this.embeddedScenes[scene.name] = scene.sources.filter(source => source.type === "scene").map(source => source.name)
        })
    }
    private notifyProgramChanged(scenes: string[]) {
        const programs: string[] = []
        scenes.forEach(scene => {
            programs.push(scene)
            programs.push(...(this.embeddedScenes[scene] || []))
        })

        this.communicator.notifyProgramChanged(programs)
    }
    private notifyPreviewChanged(scenes: string[]) {
        const previews: string[] = []
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
        return this.obs !== undefined && this.connected
    }
    static readonly ID = "obs"
    static readonly defaultIp = "127.0.0.1"
    static readonly defaultPort = 4444
}

export default ObsConnector
