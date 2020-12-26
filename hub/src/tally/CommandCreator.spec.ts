import Tally from '../domain/Tally'
import CommandCreator from './CommandCreator'

describe('createStateCommand', () => {
    test('it shows HIGHLIGHT regardless of anything else', () => {
        const tally = new Tally("test", "channel")
        tally.setHighlight(true)
        expect(CommandCreator.createStateCommand(tally, ["channel"], [])).toEqual("highlight")
    })
    test('it shows PREVIEW', () => {
        const tally = new Tally("test", "channel")
        expect(CommandCreator.createStateCommand(tally, ["other-channel"], ["channel"])).toEqual("preview")
    })
    test('it shows ON-AIR', () => {
        const tally = new Tally("test", "channel")
        expect(CommandCreator.createStateCommand(tally, ["channel"], ["other-channel"])).toEqual("on-air")
    })
    test('it shows ON-AIR if channel is in preview and on-air', () => {
        const tally = new Tally("test", "channel")
        expect(CommandCreator.createStateCommand(tally, ["channel"], ["channel"])).toEqual("on-air")
    })
    test('it shows RELEASE if tally is patched and it is not on-air or in preview', () => {
        const tally = new Tally("test", "channel")
        expect(CommandCreator.createStateCommand(tally, ["other-channel"], [])).toEqual("release")
    })
    test('it shows RELEASE if tally is not patched', () => {
        const tally = new Tally("test")
        expect(CommandCreator.createStateCommand(tally, ["other-channel"], ["channel"])).toEqual("release")
    })
    test('it shows UNKNOWN if program is null and tally is patched', () => {
        const tally = new Tally("test", "channel")
        expect(CommandCreator.createStateCommand(tally, null, null)).toEqual("unknown")
    })
    test('it shows RELEASE if program is null and tally is NOT patched', () => {
        const tally = new Tally("test")
        expect(CommandCreator.createStateCommand(tally, null, null)).toEqual("release")
    })
})
