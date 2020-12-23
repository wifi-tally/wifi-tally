import { MixerDriver } from "./MixerDriver"

describe('getAllowedMixers', () => {
    test('does return the mock mixer on development, but not production', () => {
        const mixersDev = MixerDriver.getAllowedMixers(true, false)
        expect(mixersDev.length).toBeGreaterThan(2)
        expect(mixersDev).toContain("null")
        expect(mixersDev).toContain("mock")

        const mixersProd = MixerDriver.getAllowedMixers(false, false)
        expect(mixersProd.length).toBeGreaterThan(2)
        expect(mixersProd).toContain("null")
        expect(mixersProd).not.toContain("mock")
    })
    test('does return the test mixer on testing, but not production', () => {
        const mixersDev = MixerDriver.getAllowedMixers(false, true)
        expect(mixersDev.length).toBeGreaterThan(2)
        expect(mixersDev).toContain("null")
        expect(mixersDev).toContain("test")

        const mixersProd = MixerDriver.getAllowedMixers(false, false)
        expect(mixersProd.length).toBeGreaterThan(2)
        expect(mixersProd).toContain("null")
        expect(mixersProd).not.toContain("test")
    })
})
