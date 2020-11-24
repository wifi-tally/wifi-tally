function isValidPort(port: number): boolean {
    return port > 0 && port <= 65535
}

export class IpPort {
    port: number

    constructor(port: number) {
        if (!isValidPort(port)) {
            throw `Invalid Port: ${port}`
        } else {
            this.port = port
        }
    }
    toNumber() {
        return this.port
    }
}

export default (port: number) => new IpPort(port)
