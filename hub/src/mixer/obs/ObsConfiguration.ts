import ipAddress, {IpAddress} from '../../domain/IpAddress'
import ipPort, {IpPort} from '../../domain/IpPort'
import {Configuration} from '../interfaces'

export type ObsConfigurationSaveType = {
    ip: string
    port: number
    liveMode?: ObsConfigurationLiveMode
}

export type ObsConfigurationLiveMode = "always" | "stream" | "record" | "streamOrRecord"

class ObsConfiguration extends Configuration {
    ip: IpAddress
    port: IpPort
    liveMode: ObsConfigurationLiveMode


    constructor() {
        super()
        this.ip = ObsConfiguration.defaultIp
        this.port = ObsConfiguration.defaultPort
        this.liveMode = ObsConfiguration.defaultLiveMode
    }

    fromJson(data: ObsConfigurationSaveType): void {
        this.loadIpAddress("ip", this.setIp.bind(this), data)
        this.loadIpPort("port", this.setPort.bind(this), data)
        data.liveMode && this.setLiveMode(data.liveMode)
    }
    toJson(): ObsConfigurationSaveType {
        return {
            ip: this.ip.toString(),
            port: this.port.toNumber(),
            liveMode: this.liveMode,
        }
    }
    clone(): ObsConfiguration {
        const clone = new ObsConfiguration()
        clone.fromJson(this.toJson())
        return clone
    }

    setIp(ip: IpAddress | string | null) {
        if (typeof ip === "string") {
            ip = ipAddress(ip)
        } else if (ip === null) {
            ip = ObsConfiguration.defaultIp
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
            port = ObsConfiguration.defaultPort
        }
        this.port = port
        
        return this
    }
    getPort() {
        return this.port
    }

    setLiveMode(mode: ObsConfigurationLiveMode) {
        this.liveMode = mode
    }
    getLiveMode() {
        return this.liveMode
    }

    private static readonly defaultIp = ipAddress("127.0.0.1")
    private static readonly defaultPort = ipPort(4444)
    private static readonly defaultLiveMode = "always"

    static isValidLiveMode(theString: string): theString is ObsConfigurationLiveMode {
        return theString === "always" || theString === "streamOrRecord" || theString === "stream" || theString === "record"
    }

}

export default ObsConfiguration
