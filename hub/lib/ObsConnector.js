const OBSWebSocket = require('obs-websocket-js')

const reconnectTimeoutMs = 1000

// uses obs-websockets
// @see https://github.com/Palakis/obs-websocket
class ObsConnector {
    constructor(ip, port, communicator) {
        this.ip = ip
        this.port = port
        this.communicator = communicator
    }
    connect() {
        this.obs = new OBSWebSocket()
        this.obs.on('error', err => {
            console.error("obs socket error:", err)
        })

        const connect = () => {
            console.log(`Connecting to OBS at ${this.ip}:${this.port}`)
            this.obs.connect({address: `${this.ip}:${this.port}`}).then(() => {
                this.onConnection()
            }).catch(err => {
                console.error("error when connecting to obs:", err)
                setTimeout(connect, reconnectTimeoutMs)
            })
        }

        connect()

        this.communicator.notifyProgramChanged(null, null)
    }
    onConnection() {
        this.obs.send("GetSceneList").then(data => {
            console.log(data)
            data.scenes.forEach(scene => {
                console.log(scene.sources)
            })
        }).catch(err => {
            console.error(err)
            // @TODO
        })
    }

    disconnect() {
        if (this.obs) {
            this.obs.disconnect()
        }
    }

    isConnected() {
        // @TODO
        return null
    }
}

ObsConnector.ID = "obs"
ObsConnector.defaultIp = "127.0.0.1"
ObsConnector.defaultPort = 4444

module.exports = ObsConnector;