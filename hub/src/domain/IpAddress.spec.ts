import IpAddress from './IpAddress'

describe('it parses valid ip addresses', () => {
    [
        "0.0.0.0",
        "127.0.0.1",
        "10.10.1.1",
        "localhost",
    ].forEach((address) => {
        it(address, () => {
            const ip = IpAddress(address)
            expect(ip.toString()).toEqual(address)
        })
    })
})

describe('it fails on invalid ip addresses', () => {
    [
        "123.456.789.123",
        "1.2.3.4.5",
        "127.0.0.1  ",
        " 127 .0. 0.1",
        "12 7.0 .0.1",
        " 127.0.0.1",
        "1.2.3",
        "invalid",
        123456,
        null,
    ].forEach((address) => {
        it(`"${address}"`, () => {
            expect(() => {
                // @ts-ignore test invalid types on purpose
                IpAddress(address)
            }).toThrowError()
        })
    })
})

