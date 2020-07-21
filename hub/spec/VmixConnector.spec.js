const VmixConnector = require('../lib/VmixConnector')
const net = require('net')
const EventEmitter = require('events')

const waitUntil = (fn) => {
    return new Promise((resolve, _) => {
        setInterval(() => {
            if (fn() == true) {
                resolve()
            }
        }, 100)
    })
}

describe('VmixConnector', () => {
    describe('onData', () => {
        test('recognizes VERSION OK', async () => {
            const emitter = new EventEmitter()
            const server = net.Server((sck) => {
                sck.write(Buffer.from("VERSION OK 0.1.2.3\r\n", "utf-8"))
            })
            server.listen(0)
            const vmix = new VmixConnector('127.0.0.1', server.address().port, emitter)
            try {
                expect(vmix.wasHelloReceived).toBe(false)
                vmix.connect()
                await waitUntil(() => vmix.wasHelloReceived == true).then(() => 
                    expect(vmix.wasHelloReceived).toBe(true)
                )
            } finally {
                vmix.disconnect()
                // @TODO: fix the hacky wait for disconnect
                await new Promise((resolve, _) => setTimeout(() => resolve(), 500))
                await server.close()
            }
        })
        test('recognizes SUBSCRIBE OK TALLY', async () => {
            const emitter = new EventEmitter()
            const server = net.Server((sck) => {
                sck.on('data', data => {
                    expect(data.toString()).toBe("SUBSCRIBE TALLY\r\n")
                    sck.write(Buffer.from("SUBSCRIBE OK TALLY Subscribed\r\n", "utf-8"))
                })
                sck.write(Buffer.from("VERSION OK 0.1.2.3", "utf-8"))
            })
            // @TODO: random free port
            server.listen(0)
            const vmix = new VmixConnector('127.0.0.1', server.address().port, emitter)
            try {
                expect(vmix.wasSubcribeOkReceived).toBe(false)
                vmix.connect()
                await waitUntil(() => vmix.wasSubcribeOkReceived == true).then(() => 
                    expect(vmix.wasSubcribeOkReceived).toBe(true)
                )
            } finally {
                vmix.disconnect()
                // @TODO: fix the hacky wait for disconnect
                await new Promise((resolve, _) => setTimeout(() => resolve(), 500))
                await server.close()
            }
        })
        test('parses TALLY OK command', async () => {
            const emitter = new EventEmitter()

            const server = net.Server((sck) => {
                sck.on('data', data => {
                    expect(data.toString()).toBe("SUBSCRIBE TALLY\r\n")
                    sck.write(Buffer.from("SUBSCRIBE OK TALLY Subscribed\r\n", "utf-8"))
                    setTimeout(() => {
                        sck.write(Buffer.from("TALLY OK 012\r\n", "utf-8"))
                    }, 100)
                })
                sck.write(Buffer.from("VERSION OK 0.1.2.3", "utf-8"))
            })
            // @TODO: random free port
            server.listen(0)
            const vmix = new VmixConnector('127.0.0.1', server.address().port, emitter)
            try {
                vmix.connect()
                await new Promise((resolve, _) => {
                    emitter.on("program.changed", (programs, previews) => {
                        expect(programs).toEqual([2])
                        expect(previews).toEqual([3])
                        resolve()
                    })
                })
            } finally {
                vmix.disconnect()
                // @TODO: fix the hacky wait for disconnect
                await new Promise((resolve, _) => setTimeout(() => resolve(), 500))
                await server.close()
            }
        })
        test('parses complex TALLY OK command', async () => {
            const emitter = new EventEmitter()

            const server = net.Server((sck) => {
                sck.on('data', data => {
                    expect(data.toString()).toBe("SUBSCRIBE TALLY\r\n")
                    sck.write(Buffer.from("SUBSCRIBE OK TALLY Subscribed\r\n", "utf-8"))
                    setTimeout(() => {
                        sck.write(Buffer.from("TALLY OK 012210\r\n", "utf-8"))
                    }, 100)
                })
                sck.write(Buffer.from("VERSION OK 0.1.2.3", "utf-8"))
            })
            // @TODO: random free port
            server.listen(0)
            const vmix = new VmixConnector('127.0.0.1', server.address().port, emitter)
            try {
                vmix.connect()
                await new Promise((resolve, _) => {
                    emitter.on("program.changed", (programs, previews) => {
                        expect(programs).toEqual([2, 5])
                        expect(previews).toEqual([3, 4])
                        resolve()
                    })
                })
            } finally {
                vmix.disconnect()
                // @TODO: fix the hacky wait for disconnect
                await new Promise((resolve, _) => setTimeout(() => resolve(), 500))
                await server.close()
            }
        })
    })
})
