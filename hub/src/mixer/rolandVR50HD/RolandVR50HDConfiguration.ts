import ipAddress, {IpAddress} from '../../domain/IpAddress'
import ipPort, {IpPort} from '../../domain/IpPort'
import {Configuration} from '../interfaces'

export type RolandVR50HDConfigurationSaveType = {
    ip: string
    port: number
}

class RolandVR50HDConfiguration extends Configuration {
    ip: IpAddress
    port: IpPort

    constructor() {
        super()
        this.ip = RolandVR50HDConfiguration.defaultIp
        this.port = RolandVR50HDConfiguration.defaultPort
    }

    fromJson(data: RolandVR50HDConfigurationSaveType): void {
        this.loadIpAddress("ip", this.setIp.bind(this), data)
        this.loadIpPort("port", this.setPort.bind(this), data)
    }
    toJson(): RolandVR50HDConfigurationSaveType {
        return {
            ip: this.ip.toString(),
            port: this.port.toNumber(),
        }
    }
    clone(): RolandVR50HDConfiguration {
        const clone = new RolandVR50HDConfiguration()
        clone.fromJson(this.toJson())
        return clone
    }

    setIp(ip: IpAddress | string | null) {
        if (typeof ip === "string") {
            ip = ipAddress(ip)
        } else if (ip === null) {
            ip = RolandVR50HDConfiguration.defaultIp
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
            port = RolandVR50HDConfiguration.defaultPort
        }
        this.port = port

        return this
    }
    getPort() {
        return this.port
    }

    private static readonly defaultIp = ipAddress("127.0.0.1")
    private static readonly defaultPort = ipPort(8023)
}

export default RolandVR50HDConfiguration
