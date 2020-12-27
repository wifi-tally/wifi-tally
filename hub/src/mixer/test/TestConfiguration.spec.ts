import TestConfiguration from './TestConfiguration'

function createDefaultTestConfiguration(): TestConfiguration {
    return new TestConfiguration()
}

describe('fromJson/toJson', () => {
    it("does work", () => {
        const conf = createDefaultTestConfiguration()
        conf.setPrograms(["foo", "bar"])
        conf.setPreviews(["baz"])

        const loadedConf = createDefaultTestConfiguration()
        loadedConf.fromJson(conf.toJson())

        expect(loadedConf.getPrograms()).toEqual(["foo", "bar"])
        expect(loadedConf.getPreviews()).toEqual(["baz"])
    })
})

describe('clone', () => {
    it("does work", () => {
        const conf = createDefaultTestConfiguration()
        conf.setPrograms(["foo", "bar"])
        conf.setPreviews(["baz"])

        const clonedConf = conf.clone()
        expect(clonedConf.getPrograms()).toEqual(["foo", "bar"])
        expect(clonedConf.getPreviews()).toEqual(["baz"])
    })
})
