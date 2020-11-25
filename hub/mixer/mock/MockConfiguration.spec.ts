import MockConfiguration from './MockConfiguration'

function createDefaultMockConfiguration(): MockConfiguration {
    return new MockConfiguration()
}

describe('getTickTime/setTickTime', () => {
    it("has a default", () => {
        const conf = createDefaultMockConfiguration()
        expect(conf.getTickTime()).toBeGreaterThan(0)
    })
    it("allows to set a number", () => {
        const conf = createDefaultMockConfiguration()
        conf.setTickTime(1234)
        expect(conf.getTickTime()).toEqual(1234)
    })
    it("errors on a negative number", () => {
        const conf = createDefaultMockConfiguration()
        expect(() => {
            conf.setTickTime(-100)
        }).toThrowError()
    })
    it("allows to set a string", () => {
        const conf = createDefaultMockConfiguration()
        conf.setTickTime("1234")
        expect(conf.getTickTime()).toEqual(1234)
    })
    it("errors on non numeric string", () => {
        const conf = createDefaultMockConfiguration()
        expect(() => {
            conf.setTickTime("Hello World")
        }).toThrowError()
    })
    it("allows to restore the default", () => {
        const conf = createDefaultMockConfiguration()
        conf.setTickTime(1234)
        expect(conf.getTickTime()).toEqual(1234)
        conf.setTickTime(null)
        expect(conf.getTickTime()).not.toEqual(1234)
        expect(conf.getTickTime()).toBeGreaterThan(0)
    })
})

describe("setChannel*/getChannels/getChannelCount", () => {
    it("has a default", () => {
        const conf = createDefaultMockConfiguration()
        const channels = conf.getChannels()
        expect(channels.length).toBeGreaterThan(0)
        expect(conf.getChannelCount()).toBeGreaterThan(0)
    })
    it("allows to change the channel count", () => {
        const conf = createDefaultMockConfiguration()
        conf.setChannelCount(42)
        const channels = conf.getChannels()
        expect(channels.length).toEqual(42)
        expect(conf.getChannelCount()).toEqual(42)
    })
    it("allows to set the channels name via string array", () => {
        const conf = createDefaultMockConfiguration()
        conf.setChannelCount(3)
        conf.setChannelNames(["one", "two", "three"])
        const channels = conf.getChannels()
        expect(channels.length).toEqual(3)
        expect(conf.getChannelCount()).toEqual(3)
        expect(channels[0].name).toEqual("one")
        expect(channels[1].name).toEqual("two")
        expect(channels[2].name).toEqual("three")
    })
    it("allows to set the channels name via comma-seperated string", () => {
        const conf = createDefaultMockConfiguration()
        conf.setChannelCount(3)
        conf.setChannelNames("one, two, three")
        const channels = conf.getChannels()
        expect(channels.length).toEqual(3)
        expect(conf.getChannelCount()).toEqual(3)
        expect(channels[0].name).toEqual("one")
        expect(channels[1].name).toEqual("two")
        expect(channels[2].name).toEqual("three")
    })
    it("removes all channel names with empty string", () => {
        const conf = createDefaultMockConfiguration()
        conf.setChannelCount(3)
        conf.setChannelNames("")
        const channels = conf.getChannels()
        expect(channels.length).toEqual(3)
        expect(conf.getChannelCount()).toEqual(3)
        expect(channels[0].name).toBeFalsy()
        expect(channels[1].name).toBeFalsy()
        expect(channels[2].name).toBeFalsy()
    })
})

describe('fromSave/toSave', () => {
    it("does work", () => {
        const conf = createDefaultMockConfiguration()
        conf.setTickTime(1234)
        conf.setChannelCount(7)
        conf.setChannelNames(["one", "two", "three"])
        const loadedConf = createDefaultMockConfiguration()
        loadedConf.fromSave(conf.toSave())
        
        expect(loadedConf.getTickTime()).toEqual(1234)
        expect(loadedConf.getChannels()).toEqual(conf.getChannels())
    })
})

describe('clone', () => {
    it("does work", () => {
        const conf = createDefaultMockConfiguration()
        conf.setTickTime(1234)
        conf.setChannelCount(7)
        conf.setChannelNames(["one", "two", "three"])

        const clone = conf.clone()
        conf.setTickTime(2345) // it should be a new instance
        
        expect(clone.getTickTime()).toEqual(1234)
        expect(clone.getChannels()).toEqual(conf.getChannels())
    })
})
