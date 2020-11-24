import { config } from 'yargs'
import AtemConfiguration from './AtemConfiguration'
import ipPort from '../../domain/IpPort'
import ipAddress from '../../domain/IpAddress'

function createDefaultAtemConfiguration() {
    return new AtemConfiguration()
}

describe('getPort/setPort', () => {
    it("has a default", () => {
        const conf = createDefaultAtemConfiguration()
        expect(conf.getPort()).toBeTruthy()
    })
    it("allows to set an IpPort", () => {
        const conf = createDefaultAtemConfiguration()
        conf.setPort(ipPort(1234))
        expect(conf.getPort().toNumber()).toEqual(1234)
    })
    it("allows to set a number", () => {
        const conf = createDefaultAtemConfiguration()
        conf.setPort(1234)
        expect(conf.getPort().toNumber()).toEqual(1234)
    })
    it("allows to restore the default", () => {
        const conf = createDefaultAtemConfiguration()
        conf.setPort(1234)
        expect(conf.getPort().toNumber()).toEqual(1234)
        conf.setPort(null)
        expect(conf.getPort()).toBeTruthy()
    })
})

describe('getIp/setIp', () => {
    it("has a default", () => {
        const conf = createDefaultAtemConfiguration()
        expect(conf.getIp()).toBeTruthy()
    })
    it("allows to set an IpPort", () => {
        const conf = createDefaultAtemConfiguration()
        conf.setIp(ipAddress("1.2.3.4"))
        expect(conf.getIp().toString()).toEqual("1.2.3.4")
    })
    it("allows to set a number", () => {
        const conf = createDefaultAtemConfiguration()
        conf.setIp("1.2.3.4")
        expect(conf.getIp().toString()).toEqual("1.2.3.4")
    })
    it("allows to restore the default", () => {
        const conf = createDefaultAtemConfiguration()
        conf.setIp("1.2.3.4")
        expect(conf.getIp().toString()).toEqual("1.2.3.4")
        conf.setIp(null)
        expect(conf.getIp()).toBeTruthy()
    })
})

describe('fromSave/toSave', () => {
    it("does work", () => {
        const conf = createDefaultAtemConfiguration()
        conf.setIp("1.2.3.4")
        conf.setPort(1234)
        const loadedConf = createDefaultAtemConfiguration()
        loadedConf.fromSave(conf.toSave())
        
        expect(loadedConf.getIp().toString()).toEqual("1.2.3.4")
        expect(loadedConf.getPort().toNumber()).toEqual(1234)
    })
})

describe('clone', () => {
    it("does work", () => {
        const conf = createDefaultAtemConfiguration()
        conf.setIp("1.2.3.4")
        conf.setPort(1234)

        const clone = conf.clone()
        conf.setIp("2.3.4.5") // it should be a new instance
        
        expect(clone.getIp().toString()).toEqual("1.2.3.4")
        expect(clone.getPort().toNumber()).toEqual(1234)
    })
})
