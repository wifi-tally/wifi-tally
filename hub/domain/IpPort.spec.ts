import IpPort from './IpPort'

describe('it parses valid port', () => {
    [
        20,
        42,
        3000,
        8000,
    ].forEach((ipPort) => {
        it(`${ipPort}`, () => {
            const port = IpPort(ipPort)
            expect(port.toNumber()).toEqual(ipPort)
        })
    })
})

describe('it fails on invalid port', () => {
    [
        0,
        123456,
        -42,
        "invalid",
    ].forEach((ipPort) => {
        it(`"${ipPort}"`, () => {
            expect(() => {
                // @ts-ignore test invalid types on purpose
                IpPort(ipPort)
            }).toThrowError()
        })
    })
})

