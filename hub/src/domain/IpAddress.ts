function isValidIp(address: string): boolean {
    if (address === "localhost") { return true }

    // ipv4
    const [one, two, three, four, rest] = address.split(".")
    if (rest !== undefined) {
        return false
    }
    return [one, two, three, four].every((segment) => {
        return segment !== undefined && segment.match(/^\d{1,3}$/) !== null && parseInt(segment, 10) >= 0 && parseInt(segment, 10) <= 255
    })
}

export class IpAddress {
    address: string
    constructor(address: string) {
        if (!isValidIp(address)) {
            throw new Error(`Invalid IP address: ${address}`)
        } else {
            this.address = address
        }
    }

    toString() {
        return this.address
    }
}

const ipAddress = (address: string) => new IpAddress(address)

export default ipAddress
