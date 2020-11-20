const tmp = require('tmp')
tmp.setGracefulCleanup()
const fs = require('fs')

const Configuration = require('./Configuration')
const EventEmitter = require('events')
const {Channel} = require('../domain/Channel')

describe('Configuration', () => {
    describe('load()', () => {
        test('issues a warning if file does not exist and uses defaults', () => {
            let warningsLogged = 0
            console.warn = () => { warningsLogged++ }
            process.env.CONFIG_FILE = "/tmp/this/file/does/not/exist.json"
            
            const emitter = new EventEmitter()
            let config
            expect(() => {
                config = new Configuration(emitter)
            }).not.toThrow(SyntaxError)

            expect(warningsLogged).toEqual(1)
            expect(config.getHttpPort()).toBeGreaterThan(0)
        })
        // @see https://github.com/wifi-tally/wifi-tally/issues/26
        test('issues a warning if file is empty and uses defaults', done => {
            let warningsLogged = 0
            console.warn = () => { warningsLogged++ }
            tmp.file((err, path) => {
                if (err) { throw err }
                process.env.CONFIG_FILE = path
                
                const emitter = new EventEmitter()
                let config
                expect(() => {
                    config = new Configuration(emitter)
                }).not.toThrow(SyntaxError)

                expect(warningsLogged).toEqual(1)
                expect(config.getHttpPort()).toBeGreaterThan(0)
                done()
            })
        })
        test('fails if file is non-empty with jibberish data', done => {
            tmp.file((err, path, fd) => {
                if (err) { throw err }
                fs.write(fd, "Hello World", (err) => { if (err) { throw err }})

                process.env.CONFIG_FILE = path
                
                const emitter = new EventEmitter()
                expect(() => {
                    new Configuration(emitter)
                }).toThrow(Error)
                done()
            })
        })
        test('fails if file is non-empty with invalid json', done => {
            tmp.file((err, path, fd) => {
                if (err) { throw err }
                fs.write(fd, '{"invalid": "JSON"', (err) => { if (err) { throw err }})

                process.env.CONFIG_FILE = path
                
                const emitter = new EventEmitter()
                expect(() => {
                    new Configuration(emitter)
                }).toThrow(Error)
                done()
            })
        })
    })

    test('it can read its own configuration', done => {
        const atemIp = "10.1.1.42"
        const atemPort = 1234
        const vmixIp = "10.1.1.43"
        const vmixPort = 2345
        const obsIp = "10.1.1.44"
        const obsPort = 3456
        const mockTickTime = 4242
        const mockChannelCount = 42
        const mockChannelNames = "foobar, baz"
        const mixerSelection = "mock"
        const mockTallyData = {
            foobar: {
                name: "foobar",
                channelId: 2
            },
            baz: {
                name: "baz",
                channelId: 3
            }
        }

        const mockChannels = [
            new Channel(5, "Chanel No 5"),
            new Channel("foobar", "Baz"),
        ]

        tmp.file(async (err, path) => {
            if (err) { throw err }
            process.env.CONFIG_FILE = path
            
            const emitter = new EventEmitter()
            let beforeConfig = new Configuration(emitter)
            
            beforeConfig.updateMixerSelection(mixerSelection)
            beforeConfig.updateAtemConfig(atemIp, atemPort)
            beforeConfig.updateObsConfig(obsIp, obsPort)
            beforeConfig.updateVmixConfig(vmixIp, vmixPort)
            beforeConfig.updateMockConfig(mockTickTime, mockChannelCount, mockChannelNames)
            beforeConfig.updateTallies({toValueObjectsForSave: () => mockTallyData})
            beforeConfig.setChannels(mockChannels)
            await beforeConfig.save()

            let afterConfig = new Configuration(emitter)
            
            expect(beforeConfig.getMixerSelection()).toEqual(mixerSelection)
            expect(afterConfig.getMixerSelection()).toEqual(mixerSelection)
            
            expect(beforeConfig.getAtemIp()).toEqual(atemIp)
            expect(afterConfig.getAtemIp()).toEqual(atemIp)
            expect(beforeConfig.getAtemPort()).toEqual(atemPort)
            expect(afterConfig.getAtemPort()).toEqual(atemPort)
            
            expect(beforeConfig.getObsIp()).toEqual(obsIp)
            expect(afterConfig.getObsIp()).toEqual(obsIp)
            expect(beforeConfig.getObsPort()).toEqual(obsPort)
            expect(afterConfig.getObsPort()).toEqual(obsPort)
            
            expect(beforeConfig.getVmixIp()).toEqual(vmixIp)
            expect(afterConfig.getVmixIp()).toEqual(vmixIp)
            expect(beforeConfig.getVmixPort()).toEqual(vmixPort)
            expect(afterConfig.getVmixPort()).toEqual(vmixPort)
            
            expect(beforeConfig.getMockTickTime()).toEqual(mockTickTime)
            expect(afterConfig.getMockTickTime()).toEqual(mockTickTime)
            expect(beforeConfig.getMockChannelCount()).toEqual(mockChannelCount)
            expect(afterConfig.getMockChannelCount()).toEqual(mockChannelCount)
            expect(beforeConfig.getMockChannelNames()).toEqual(mockChannelNames)
            expect(afterConfig.getMockChannelNames()).toEqual(mockChannelNames)

            expect(beforeConfig.getTallies()).toEqual(mockTallyData)
            expect(afterConfig.getTallies()).toEqual(mockTallyData)

            expect(beforeConfig.getChannels()[0].id).toEqual("5")
            expect(afterConfig.getChannels()[0].id).toEqual("5")
            expect(beforeConfig.getChannels()[0].name).toEqual("Chanel No 5")
            expect(afterConfig.getChannels()[0].name).toEqual("Chanel No 5")
            expect(beforeConfig.getChannels()[1].id).toEqual("foobar")
            expect(afterConfig.getChannels()[1].id).toEqual("foobar")
            expect(beforeConfig.getChannels()[1].name).toEqual("Baz")
            expect(afterConfig.getChannels()[1].name).toEqual("Baz")

            done()
        })
    })
    
})
