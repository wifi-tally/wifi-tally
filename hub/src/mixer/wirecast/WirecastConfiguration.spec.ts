import WirecastConfiguration from './WirecastConfiguration'
import ipPort from '../../domain/IpPort'
import ipAddress from '../../domain/IpAddress'

function createDefaultWirecastConfiguration() {
    return new WirecastConfiguration()
}

describe('getPort/setPort', () => {
    it("has a default", () => {
        const conf = createDefaultWirecastConfiguration()
        expect(conf.getPort()).toBeTruthy()
    })
    it("allows to set an IpPort", () => {
        const conf = createDefaultWirecastConfiguration()
        conf.setPort(ipPort(1234))
        expect(conf.getPort().toNumber()).toEqual(1234)
    })
    it("allows to set a number", () => {
        const conf = createDefaultWirecastConfiguration()
        conf.setPort(1234)
        expect(conf.getPort().toNumber()).toEqual(1234)
    })
    it("allows to restore the default", () => {
        const conf = createDefaultWirecastConfiguration()
        conf.setPort(1234)
        expect(conf.getPort().toNumber()).toEqual(1234)
        conf.setPort(null)
        expect(conf.getPort()).toBeTruthy()
    })
})

describe('getIp/setIp', () => {
    it("has a default", () => {
        const conf = createDefaultWirecastConfiguration()
        expect(conf.getIp()).toBeTruthy()
    })
    it("allows to set an IpPort", () => {
        const conf = createDefaultWirecastConfiguration()
        conf.setIp(ipAddress("1.2.3.4"))
        expect(conf.getIp().toString()).toEqual("1.2.3.4")
    })
    it("allows to set a number", () => {
        const conf = createDefaultWirecastConfiguration()
        conf.setIp("1.2.3.4")
        expect(conf.getIp().toString()).toEqual("1.2.3.4")
    })
    it("allows to restore the default", () => {
        const conf = createDefaultWirecastConfiguration()
        conf.setIp("1.2.3.4")
        expect(conf.getIp().toString()).toEqual("1.2.3.4")
        conf.setIp(null)
        expect(conf.getIp()).toBeTruthy()
    })
})

describe('fromJson/toJson', () => {
    it("does work", () => {
        const conf = createDefaultWirecastConfiguration()
        conf.setIp("1.2.3.4")
        conf.setPort(1234)
        conf.setLiveMode("stream")
        conf.setLayers([4, 2])
        const loadedConf = createDefaultWirecastConfiguration()
        loadedConf.fromJson(conf.toJson())
        
        expect(loadedConf.getIp().toString()).toEqual("1.2.3.4")
        expect(loadedConf.getPort().toNumber()).toEqual(1234)
        expect(loadedConf.getLiveMode()).toEqual("stream")
        expect(loadedConf.getLayers()).toEqual([4, 2])
    })
})

describe('clone', () => {
    it("does work", () => {
        const conf = createDefaultWirecastConfiguration()
        conf.setIp("1.2.3.4")
        conf.setPort(1234)
        conf.setLiveMode("stream")
        conf.setLayers([4, 2])
        const clone = conf.clone()
        conf.setIp("2.3.4.5") // it should be a new instance
        
        expect(clone.getIp().toString()).toEqual("1.2.3.4")
        expect(clone.getPort().toNumber()).toEqual(1234)
        expect(clone.getLiveMode()).toEqual("stream")
        expect(clone.getLayers()).toEqual([4, 2])
    })
})
