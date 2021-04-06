import RolandV8HDConfiguration from './RolandV8HDConfiguration'

function createDefaultRolandV8HDConfiguration() {
    return new RolandV8HDConfiguration()
}

describe('getRequestInterval/setRequestInterval', () => {
    it("has a default", () => {
        const conf = createDefaultRolandV8HDConfiguration()
        expect(conf.getRequestInterval()).toBeTruthy()
    })
    it("allows to set String", () => {
        const conf = createDefaultRolandV8HDConfiguration()
        conf.setRequestInterval("300")
        expect(conf.getRequestInterval() == 300)
    })
    it("allows to restore the default", () => {
        const conf = createDefaultRolandV8HDConfiguration()
        conf.setRequestInterval(300)
        expect(conf.getRequestInterval() == 300)
        conf.setRequestInterval(null)
        expect(conf.getRequestInterval()).toBeTruthy()
    })
})

describe('fromJson/toJson', () => {
    it("does work", () => {
        const conf = createDefaultRolandV8HDConfiguration()
        conf.setRequestInterval(300)
        const loadedConf = createDefaultRolandV8HDConfiguration()
        loadedConf.fromJson(conf.toJson())

        expect(loadedConf.getRequestInterval().toString()).toEqual("300")
    })
})

describe('clone', () => {
    it("does work", () => {
        const conf = createDefaultRolandV8HDConfiguration()
        conf.setRequestInterval("4242")
        const clone = conf.clone()
        conf.setRequestInterval("4343") // it should be a new instance

        expect(clone.getRequestInterval().toString()).toEqual("4242")
    })
})
