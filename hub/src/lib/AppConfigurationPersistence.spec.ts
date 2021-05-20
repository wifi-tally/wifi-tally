import tmp from 'tmp'
import fs from 'fs'
import { AppConfiguration } from './AppConfiguration'
import { EventEmitter } from 'events'
import AppConfigurationPersistence from './AppConfigurationPersistence'

tmp.setGracefulCleanup()

describe('load()', () => {
    test('issues a warning if file does not exist and uses defaults', () => {
        let warningsLogged = 0
        console.warn = () => { warningsLogged++ }
        
        const emitter = new EventEmitter()
        let config = new AppConfiguration(emitter)
        expect(() => {
            new AppConfigurationPersistence(config, emitter, "/tmp/this/file/does/not/exist.json")
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
            
            const emitter = new EventEmitter()
            let config = new AppConfiguration(emitter)
            expect(() => {
                new AppConfigurationPersistence(config, emitter, path)
            }).not.toThrow(SyntaxError)

            expect(warningsLogged).toEqual(1)
            expect(config.getHttpPort()).toBeGreaterThan(0)
            done()
        })
    })
    test('fails if file is non-empty with jibberish data', done => {
        let errorsLogged = 0
        console.error = () => { errorsLogged++ }
        tmp.file((err, path, fd) => {
            if (err) { throw err }
            fs.write(fd, "Hello World", (err) => { if (err) { throw err }})
            
            const emitter = new EventEmitter()
            const config = new AppConfiguration(emitter)
            expect(() => {
                new AppConfigurationPersistence(config, emitter, path)
            }).toThrow(Error)

            expect(errorsLogged).toEqual(1)
            done()
        })
    })
    test('fails if file is non-empty with invalid json', done => {
        let errorsLogged = 0
        console.error = () => { errorsLogged++ }
        tmp.file((err, path, fd) => {
            if (err) { throw err }
            fs.write(fd, '{"invalid": "JSON"', (err) => { if (err) { throw err }})

            const emitter = new EventEmitter()
            const conf = new AppConfiguration(emitter)
            expect(() => {
                new AppConfigurationPersistence(conf, emitter, path)
            }).toThrow(Error)

            expect(errorsLogged).toEqual(1)
            done()
        })
    })  
})

describe('it can load configuration files from previous versions', () => {
    it('can load from v0.2.1', () => {
        const emitter = new EventEmitter()
        const config = new AppConfiguration(emitter)

        expect(() => {
            new AppConfigurationPersistence(config, emitter, `${__dirname}/../../fixtures/settings-v0.2.1.json`)
        }).not.toThrow(SyntaxError)

        expect(config.getMixerSelection()).toEqual("obs")
        expect(config.getObsConfiguration().getIp().toString()).toEqual("127.0.0.1")
        expect(config.getObsConfiguration().getPort().toString()).toEqual("4444")
        expect(config.getTallies()).toHaveLength(4)
        expect(config.getTallies()[0].name).toEqual("Tally01")
        expect(config.getTallies()[0].channelId).toEqual("1")
        expect(config.getChannels()).toHaveLength(8)
        expect(config.getChannels()[0].id).toEqual("1")
        expect(config.getChannels()[0].name).toEqual("Dave's Cam")
    })
    it('can load from v0.3.0', () => {
        const emitter = new EventEmitter()
        const config = new AppConfiguration(emitter)

        expect(() => {
            new AppConfigurationPersistence(config, emitter, `${__dirname}/../../fixtures/settings-v0.3.0.json`)
        }).not.toThrow(SyntaxError)

        expect(config.getMixerSelection()).toEqual("atem")
        expect(config.getAtemConfiguration().getIp().toString()).toEqual("192.168.99.200")
        expect(config.getAtemConfiguration().getPort().toString()).toEqual("9910")
        expect(config.getTallies()).toHaveLength(4)
        expect(config.getTallies()[0].name).toEqual("Tally01")
        expect(config.getTallies()[0].channelId).toEqual("1")
        expect(config.getTallies()[0].type).toEqual("udp")
        expect(config.getTallies()[3].name).toEqual("Tally04")
        expect(config.getTallies()[3].type).toEqual("web")
        expect(config.getChannels()).toHaveLength(4)
        expect(config.getChannels()[0].id).toEqual("1")
        expect(config.getChannels()[0].name).toEqual("Dave's Cam")
    })
    it('can load from v0.4.0', () => {
        const emitter = new EventEmitter()
        const config = new AppConfiguration(emitter)

        expect(() => {
            new AppConfigurationPersistence(config, emitter, `${__dirname}/../../fixtures/settings-v0.4.0.json`)
        }).not.toThrow(SyntaxError)

        expect(config.getMixerSelection()).toEqual("vmix")
        expect(config.getVmixConfiguration().getIp().toString()).toEqual("127.0.0.1")
        expect(config.getVmixConfiguration().getPort().toString()).toEqual("8099")
        expect(config.getTallyConfiguration().getOperatorLightBrightness()).toEqual(80)
        expect(config.getTallyConfiguration().getStageLightBrightness()).toEqual(60)
        expect(config.getTallies()).toHaveLength(4)
        expect(config.getTallies()[0].name).toEqual("Tally01")
        expect(config.getTallies()[0].channelId).toEqual("1")
        expect(config.getTallies()[0].type).toEqual("udp")
        expect(config.getTallies()[0].configuration.getStageLightBrightness()).toEqual(100)
        expect(config.getTallies()[0].configuration.getOperatorLightBrightness()).toEqual(100)
        expect(config.getTallies()[0].configuration.getStageShowsPreview()).toEqual(true)
        expect(config.getTallies()[3].name).toEqual("Tally04")
        expect(config.getTallies()[3].type).toEqual("web")
        expect(config.getChannels()).toHaveLength(4)
        expect(config.getChannels()[0].id).toEqual("1")
        expect(config.getChannels()[0].name).toEqual("Dave's Cam")
    })
})

test('save/load persists data', (done) => {
    tmp.file(async (err, path) => {
        if (err) { throw err }
        
        const emitter = new EventEmitter()
        const config = new AppConfiguration(emitter)
        const persistence = new AppConfigurationPersistence(config, emitter, path)
        // we use mock configuration just as an example
        const mockConfiguration = config.getMockConfiguration()
        mockConfiguration.setChannelCount(42)
        config.setMockConfiguration(mockConfiguration)
        await persistence.save()

        // the file should exist now and have the data
        const data = fs.readFileSync(path).toString()
        expect(data).toBeTruthy()
        expect(data).toContain("This file was automatically generated.")

        const otherEmitter = new EventEmitter()
        const otherConfig = new AppConfiguration(otherEmitter)
        new AppConfigurationPersistence(otherConfig, otherEmitter, path)
        
        // the data should be loaded
        expect(otherConfig.getMockConfiguration().getChannelCount()).toEqual(42)
        done()
    })
})
