import ipAddress, {IpAddress} from '../../domain/IpAddress'
import ipPort, {IpPort} from '../../domain/IpPort'
import {Configuration} from '../interfaces'

export type ObsConfigurationSaveType = {
    ip: string
    port: number
}

class ObsConfiguration extends Configuration {
    ip: IpAddress
    port: IpPort

    constructor() {
        super()
        this.ip = ObsConfiguration.defaultIp
        this.port = ObsConfiguration.defaultPort
    }

    fromJson(data: ObsConfigurationSaveType): void {
        this.loadIpAddress("ip", this.setIp.bind(this), data)
        this.loadIpPort("port", this.setPort.bind(this), data)
    }
    toJson(): ObsConfigurationSaveType {
        return {
            ip: this.ip.toString(),
            port: this.port.toNumber(),
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

    setPort(port: IpPort | number | null) {
        if (typeof port === "number") {
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

    private static readonly defaultIp = ipAddress("127.0.0.1")
    private static readonly defaultPort = ipPort(4444)
}

export default ObsConfiguration
