import ipAddress, {IpAddress} from "../domain/IpAddress"
import ipPort, { IpPort } from "../domain/IpPort"

export type SettingsProps = {
    id: string
    label: string
}

export interface Connector {
    connect() : void
    disconnect() : void
    isConnected(): boolean
}

export abstract class Configuration {
    abstract fromSave(data: object): void
    abstract toSave(): object
    abstract clone(): Configuration

    protected loadIpAddress(fieldName: string, setter: (value:IpAddress) => void, data: object) {
        const value = data[fieldName]
        if (value === undefined || value === null) {
            // value is not set
            return
        } else if (typeof value === "string") {
            try {
                const ip = ipAddress(value)
                setter(ip)
            } catch (err) {
                console.error(`error loading property "${fieldName}" of configuration: ${err}`)
                return
            }
        } else {
            console.error(`error loading property "${fieldName}": invalid type ${typeof value}`)
        }
    }

    protected loadIpPort(fieldName: string, setter: (value:IpPort) => void, data: object) {
        const value = data[fieldName]
        if (value === undefined || value === null) {
            // value is not set
            return
        } else if (typeof value === "number") {
            try {
                const port = ipPort(value)
                setter(port)
            } catch (err) {
                console.error(`error loading property "${fieldName}" of configuration: ${err}`)
                return
            }
        } else {
            console.error(`error loading property "${fieldName}": invalid type ${typeof value}`)
        }
    }

    protected loadNumber(fieldName: string, setter: (value:number) => void, data: object) {
        const value = data[fieldName]
        if (value === undefined || value === null) {
            // value is not set
            return
        } else if (typeof value === "number") {
            try {
                setter(value)
            } catch (err) {
                console.error(`error loading property "${fieldName}" of configuration: ${err}`)
                return
            }
        } else {
            console.error(`error loading property "${fieldName}": invalid type ${typeof value}`)
        }
    }

    protected loadString(fieldName: string, setter: (value:string) => void, data: object) {
        const value = data[fieldName]
        if (value === undefined || value === null) {
            // value is not set
            return
        } else if (typeof value === "string") {
            try {
                setter(value)
            } catch (err) {
                console.error(`error loading property "${fieldName}" of configuration: ${err}`)
                return
            }
        } else {
            console.error(`error loading property "${fieldName}": invalid type ${typeof value}`)
        }
    }

}
