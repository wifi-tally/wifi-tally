import ipAddress, {IpAddress} from '../../domain/IpAddress'
import ipPort, {IpPort} from '../../domain/IpPort'
import {Configuration} from '../interfaces'

export type WirecastConfigurationSaveType = {
    ip: string
    port: number
    liveMode?: WirecastConfigurationLiveMode
    layers?: number[]
}

export type WirecastConfigurationLiveMode = "always" | "stream" | "record" | "streamOrRecord"

class WirecastConfiguration extends Configuration {
    ip: IpAddress
    port: IpPort
    liveMode: WirecastConfigurationLiveMode
    layers: number[]

    constructor() {
        super()
        this.ip = WirecastConfiguration.defaultIp
        this.port = WirecastConfiguration.defaultPort
        this.liveMode = WirecastConfiguration.defaultLiveMode
        this.layers = WirecastConfiguration.defaultLayers
    }

    fromJson(data: WirecastConfigurationSaveType): void {
        this.loadIpAddress("ip", this.setIp.bind(this), data)
        this.loadIpPort("port", this.setPort.bind(this), data)
        data.liveMode && this.setLiveMode(data.liveMode)
        data.layers !== undefined && this.setLayers(data.layers)
    }
    toJson(): WirecastConfigurationSaveType {
        return {
            ip: this.ip.toString(),
            port: this.port.toNumber(),
            liveMode: this.liveMode,
            layers: this.layers,
        }
    }
    clone(): WirecastConfiguration {
        const clone = new WirecastConfiguration()
        clone.fromJson(this.toJson())
        return clone
    }

    setIp(ip: IpAddress | string | null) {
        if (typeof ip === "string") {
            ip = ipAddress(ip)
        } else if (ip === null) {
            ip = WirecastConfiguration.defaultIp
        }
        this.ip = ip
        
        return this
    }
    getIp() {
        return this.ip
    }

    setPort(port: IpPort | string | number | null) {
        if (typeof port === "number" || typeof port === "string") {
            port = ipPort(port)
        } else if (port === null) {
            port = WirecastConfiguration.defaultPort
        }
        this.port = port
        
        return this
    }
    getPort() {
        return this.port
    }

    setLiveMode(mode: WirecastConfigurationLiveMode) {
        this.liveMode = mode
    }
    getLiveMode() {
        return this.liveMode
    }

    setLayers(layers: number[]) {
        this.layers = layers
    }
    getLayers(): number[] {
        return this.layers
    }

    private static readonly defaultIp = ipAddress("127.0.0.1")
    private static readonly defaultPort = ipPort(1234)
    private static readonly defaultLiveMode = "always"
    private static readonly defaultLayers = null

    static isValidLiveMode(theString: string): theString is WirecastConfigurationLiveMode {
        return theString === "always" || theString === "streamOrRecord" || theString === "stream" || theString === "record"
    }

}

export default WirecastConfiguration
