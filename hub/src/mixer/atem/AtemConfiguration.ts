import ipAddress, {IpAddress} from '../../domain/IpAddress'
import ipPort, {IpPort} from '../../domain/IpPort'
import {Configuration} from '../interfaces'

export type AtemConfigurationSaveType = {
    ip: string
    port: number
}

class AtemConfiguration extends Configuration {
    ip: IpAddress
    port: IpPort

    constructor() {
        super()
        this.ip = AtemConfiguration.defaultIp
        this.port = AtemConfiguration.defaultPort
    }

    fromJson(data: AtemConfigurationSaveType): void {
        this.loadIpAddress("ip", this.setIp.bind(this), data)
        this.loadIpPort("port", this.setPort.bind(this), data)
    }
    toJson(): AtemConfigurationSaveType {
        return {
            ip: this.ip.toString(),
            port: this.port.toNumber(),
        }
    }
    clone(): AtemConfiguration {
        const clone = new AtemConfiguration()
        clone.fromJson(this.toJson())
        return clone
    }

    setIp(ip: IpAddress | string | null) {
        if (typeof ip === "string") {
            ip = ipAddress(ip)
        } else if (ip === null) {
            ip = AtemConfiguration.defaultIp
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
            port = AtemConfiguration.defaultPort
        }
        this.port = port

        return this
    }
    getPort() {
        return this.port
    }

    private static readonly defaultIp = ipAddress("127.0.0.1")
    private static readonly defaultPort = ipPort(9910)
}

export default AtemConfiguration