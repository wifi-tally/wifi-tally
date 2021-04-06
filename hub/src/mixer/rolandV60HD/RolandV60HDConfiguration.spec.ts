import RolandV60HDConfiguration from './RolandV60HDConfiguration'
import ipPort from '../../domain/IpPort'
import ipAddress from '../../domain/IpAddress'

function createDefaultRolandV60HDConfiguration() {
    return new RolandV60HDConfiguration()
}

describe('getRequestInterval/setRequestInterval', () => {
    it("has a default", () => {
        const conf = createDefaultRolandV60HDConfiguration()
        expect(conf.getRequestInterval()).toBeTruthy()
    })
    it("allows to set String", () => {
        const conf = createDefaultRolandV60HDConfiguration()
        conf.setRequestInterval("300")
        expect(conf.getRequestInterval() == 300)
    })
    it("allows to set number", () => {
        const conf = createDefaultRolandV60HDConfiguration()
        conf.setRequestInterval(300)
        expect(conf.getRequestInterval() == 300)
    })
    it("allows to restore the default", () => {
        const conf = createDefaultRolandV60HDConfiguration()
        conf.setRequestInterval(300)
        expect(conf.getRequestInterval() == 300)
        conf.setRequestInterval(null)
        expect(conf.getRequestInterval()).toBeTruthy()
    })
})

describe('getIp/setIp', () => {
    it("has a default", () => {
        const conf = createDefaultRolandV60HDConfiguration()
        expect(conf.getIp()).toBeTruthy()
    })
    it("allows to set an IpPort", () => {
        const conf = createDefaultRolandV60HDConfiguration()
        conf.setIp(ipAddress("1.2.3.4"))
        expect(conf.getIp().toString()).toEqual("1.2.3.4")
    })
    it("allows to set a number", () => {
        const conf = createDefaultRolandV60HDConfiguration()
        conf.setIp("1.2.3.4")
        expect(conf.getIp().toString()).toEqual("1.2.3.4")
    })
    it("allows to restore the default", () => {
        const conf = createDefaultRolandV60HDConfiguration()
        conf.setIp("1.2.3.4")
        expect(conf.getIp().toString()).toEqual("1.2.3.4")
        conf.setIp(null)
        expect(conf.getIp()).toBeTruthy()
    })
})

describe('fromJson/toJson', () => {
    it("does work", () => {
        const conf = createDefaultRolandV60HDConfiguration()
        conf.setIp("1.2.3.4")
        conf.setRequestInterval(300)
        const loadedConf = createDefaultRolandV60HDConfiguration()
        loadedConf.fromJson(conf.toJson())

        expect(loadedConf.getIp().toString()).toEqual("1.2.3.4")
        expect(loadedConf.getRequestInterval() == 300)
    })
})

describe('clone', () => {
    it("does work", () => {
        const conf = createDefaultRolandV60HDConfiguration()
        conf.setIp("1.2.3.4")
        conf.setRequestInterval(300)
        const clone = conf.clone()
        conf.setIp("2.3.4.5") // it should be a new instance

        expect(clone.getIp().toString()).toEqual("1.2.3.4")
        expect(clone.getRequestInterval() == 300)
    })
})
