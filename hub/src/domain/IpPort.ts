function isValidPort(port: number): boolean {
    return Number.isInteger(port) && port > 0 && port <= 65535
}

export class IpPort {
    port: number

    constructor(port: number|string) {
        if (typeof port === "string") {
            port = parseInt(port, 10)
        }
        if (!isValidPort(port)) {
            throw new Error(`Invalid Port: ${port}`)
        } else {
            this.port = port
        }
    }
    toNumber() {
        return this.port
    }
    toString() {
        return this.toNumber().toString()
    }
}

const ipPort = (port: number|string) => new IpPort(port)

export default ipPort
