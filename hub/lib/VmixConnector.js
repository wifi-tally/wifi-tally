
class VmixConnector {
    constructor(ip, port, emitter) {
        this.ip = ip
        this.port = port
        this.emitter = emitter
        this.connect()
    }
    connect() {
    }
    disconnect() {
    }
    isConnected() {
        return true
    }
}

VmixConnector.ID = "vmix"
VmixConnector.defaultIp = "127.0.0.1"
VmixConnector.defaultPort = 8099

module.exports = VmixConnector;