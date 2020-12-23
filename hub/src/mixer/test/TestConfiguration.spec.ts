import TestConfiguration from './TestConfiguration'

function createDefaultTestConfiguration(): TestConfiguration {
    return new TestConfiguration()
}

describe('fromJson/toJson', () => {
    it("does work", () => {
        const conf = createDefaultTestConfiguration()
        const loadedConf = createDefaultTestConfiguration()
        loadedConf.fromJson(conf.toJson())

        // it does not throw an error. Apart from that it does not have any settings to check
    })
})

describe('clone', () => {
    it("does work", () => {
        const conf = createDefaultTestConfiguration()
        conf.clone()

        // it does not throw an error. Apart from that it does not have any settings to check
    })
})
