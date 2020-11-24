import tmp from 'tmp'
tmp.setGracefulCleanup()
import fs from 'fs'

import { AppConfiguration } from './AppConfiguration'
import { EventEmitter } from 'events'
import AppConfigurationPersistence from './AppConfigurationPersistence'
import { emit } from 'process'


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
        const otherPersistence = new AppConfigurationPersistence(otherConfig, otherEmitter, path)
        
        // the data should be loaded
        expect(otherConfig.getMockConfiguration().getChannelCount()).toEqual(42)
        done()
    })
})
