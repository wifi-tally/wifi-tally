const tmp = require('tmp')
tmp.setGracefulCleanup()
const fs = require('fs')

const Configuration = require('../lib/Configuration')
const EventEmitter = require('events')

describe('Configuration', () => {
    describe('load()', () => {
        test('issues a warning if file does not exist and uses defaults', () => {
            var warningsLogged = 0
            console.warn = () => { warningsLogged++ }
            process.env.CONFIG_FILE = "/tmp/this/file/does/not/exist.json"
            
            const emitter = new EventEmitter()
            var config
            expect(() => {
                config = new Configuration(emitter)
            }).not.toThrow(SyntaxError)

            expect(warningsLogged).toEqual(1)
            expect(config.getHttpPort()).toBeGreaterThan(0)
        })
        // @see https://github.com/wifi-tally/wifi-tally/issues/26
        test('issues a warning if file is empty and uses defaults', done => {
            var warningsLogged = 0
            console.warn = () => { warningsLogged++ }
            tmp.file((err, path) => {
                if (err) { throw err }
                process.env.CONFIG_FILE = path
                
                const emitter = new EventEmitter()
                var config
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

        tmp.file(async (err, path) => {
            if (err) { throw err }
            process.env.CONFIG_FILE = path
            
            const emitter = new EventEmitter()
            var beforeConfig = new Configuration(emitter)
            
            beforeConfig.updateMixerSelection(mixerSelection)
            beforeConfig.updateAtemConfig(atemIp, atemPort)
            beforeConfig.updateVmixConfig(vmixIp, vmixPort)
            beforeConfig.updateMockConfig(mockTickTime, mockChannelCount, mockChannelNames)
            beforeConfig.updateTallies({toValueObjectsForSave: () => mockTallyData})
            await beforeConfig.save()

            var afterConfig = new Configuration(emitter)
            
            expect(beforeConfig.getMixerSelection()).toEqual(mixerSelection)
            expect(afterConfig.getMixerSelection()).toEqual(mixerSelection)
            
            expect(beforeConfig.getAtemIp()).toEqual(atemIp)
            expect(afterConfig.getAtemIp()).toEqual(atemIp)
            expect(beforeConfig.getAtemPort()).toEqual(atemPort)
            expect(afterConfig.getAtemPort()).toEqual(atemPort)
            
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

            done()
        })
    })
    
})
