import RolandV60HDConnector from './RolandV60HDConnector'
import RolandV60HDConfiguration from './RolandV60HDConfiguration'
import { Server } from 'net'
import http from 'http'

const waitUntil = (fn) => {
    return new Promise((resolve, _) => {
        setInterval(() => {
            if (fn() === true) {
                resolve()
            }
        }, 100)
    })
}

class MockCommunicator {
    constructor(configuration, emitter) {
        this.isConnected = false
        this.programs
        this.previews
    }

    notifyProgramPreviewChanged(programs, previews) {
        this.programs = programs
        this.previews = previews
    }

    notifyChannelNames(count, names) {
        this.channelCount = count
        this.channelNames = names
    }

    notifyMixerIsConnected() {
        this.isConnected = true
    }

    notifyMixerIsDisconnected() {
        this.isConnected = false
    }
}

function createRolandV60HDCommunicator(ip, port, requestInterval) {
    const communicator = new MockCommunicator()
    const configuration = new RolandV60HDConfiguration()
    configuration.setIp(ip)
    configuration.setPort(port)
    configuration.setRequestInterval(requestInterval)
    const rolandV60HD = new RolandV60HDConnector(configuration, communicator)

    return [rolandV60HD, communicator]
}

describe('RolandV60HDConnector', () => {
    describe('onData', () => {
        beforeEach(() => {
            global.rolandV60HDServerConfig = {} // not sure about this?
            const server = http.createServer(function (req, res) {
              if (req.method === "GET") {
                let reqChannel = parseInt(req.url.split("/")[2])
                res.writeHead(200, { "Content-Type": "text/html" });
                switch(global.rolandV60HDServerConfig.tallies[reqChannel - 1]){
                  case 2:
                    res.write("onair")
                    break
                  case 1:
                    res.write("selected")
                    break
                  case 0:
                    res.write("unselected")
                    break
                }
                res.end()
              }
            });


            const promise = new Promise((resolve, reject) => {
                server.listen({
                    port: 3001,
                    host: '127.0.0.1',
                }, (error) => {
                    if (error) {
                        console.error(error)
                        reject(error)
                    } else {
                        global.rolandV60HDServerConfig.serverIp = server.address().address
                        global.rolandV60HDServerConfig.serverPort = server.address().port
                        resolve()
                    }
                })
            })

            global.rolandV60HDServerConfig.close = server.close.bind(server)

            return promise
        })
        afterEach(() => {
            if (global.rolandV60HDServerConfig) {
                return new Promise((resolve, reject) => {
                    global.rolandV60HDServerConfig.close((error) => {
                        if (error) {
                            console.error(error)
                            reject(error)
                        } else {
                            resolve()
                        }
                    })
                })
            }
        })

        test('parses Tally Response', async () => {
            const server = global.rolandV60HDServerConfig
            server.tallies = [0,1,2,2,1,0,0,1]
            const [rolandV60HD, communicator] = createRolandV60HDCommunicator(server.serverIp, server.serverPort, 250)
            try {
                rolandV60HD.connect()
                await waitUntil(() => communicator.programs !== undefined && rolandV60HD.isConnected()).then(() => {
                    expect(communicator.programs).toEqual(["3", "4"])
                    expect(communicator.previews).toEqual(["2", "5", "8"])
                })
            } finally {
                await rolandV60HD.disconnect()
            }
        })
    })
})
