import ipAddress, {IpAddress} from '../../domain/IpAddress'
import ipPort, {IpPort} from '../../domain/IpPort'
import {Configuration} from '../interfaces'

export type RolandV60HDConfigurationSaveType = {
    ip: string
    port: number
    requestInterval: number
}

class RolandV60HDConfiguration extends Configuration {
    ip: IpAddress
    port: IpPort
    requestInterval: number

    constructor() {
        super()
        this.ip = RolandV60HDConfiguration.defaultIp
        this.port = RolandV60HDConfiguration.defaultPort
        this.requestInterval = RolandV60HDConfiguration.defaultRequestInterval
    }

    fromJson(data: RolandV60HDConfigurationSaveType): void {
        this.loadIpAddress("ip", this.setIp.bind(this), data)
        this.loadIpPort("port", this.setPort.bind(this), data)
        this.loadNumber("requestInterval", this.setRequestInterval.bind(this), data)
    }
    toJson(): RolandV60HDConfigurationSaveType {
        return {
            ip: this.ip.toString(),
            port: this.port.toNumber(),
            requestInterval: this.requestInterval,
        }
    }
    clone(): RolandV60HDConfiguration {
        const clone = new RolandV60HDConfiguration()
        clone.fromJson(this.toJson())
        return clone
    }

    setIp(ip: IpAddress | string | null) {
        if (typeof ip === "string") {
            ip = ipAddress(ip)
        } else if (ip === null) {
            ip = RolandV60HDConfiguration.defaultIp
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
            port = RolandV60HDConfiguration.defaultPort
        }
        this.port = port

        return this
    }
    getPort() {
        return this.port
    }

    setRequestInterval(requestInterval: number | string | null){
      if(requestInterval === null){
        requestInterval = RolandV60HDConfiguration.defaultRequestInterval
      }else if(typeof requestInterval === "string"){
        requestInterval = parseInt(requestInterval, 10)
        if(!Number.isFinite(requestInterval)) {
            throw new Error(`Could not parse "${requestInterval}" into a number.`)
        }
      }
      this.requestInterval = requestInterval
    }

    getRequestInterval(){
      return this.requestInterval
    }

    private static readonly defaultIp = ipAddress("127.0.0.1")
    private static readonly defaultPort = ipPort(80)
    private static readonly defaultRequestInterval = 250
}

export default RolandV60HDConfiguration
