import {UdpTally, WebTally} from '../domain/Tally'
import CommandCreator from './CommandCreator'
import { DefaultTallyConfiguration } from './TallyConfiguration'
import 'jest-extended'

describe('createStateCommand', () => {
    const defaultConfig = new DefaultTallyConfiguration()

    test('it shows HIGHLIGHT regardless of anything else', () => {
        const tally = new UdpTally("test", "channel")
        tally.setHighlight(true)
        expect(CommandCreator.createStateCommand(tally, ["channel"], [], defaultConfig)).toStartWith("highlight ")
    })
    test('it shows PREVIEW', () => {
        const tally = new UdpTally("test", "channel")
        expect(CommandCreator.createStateCommand(tally, ["other-channel"], ["channel"], defaultConfig)).toStartWith("preview ")
    })
    test('it shows ON-AIR', () => {
        const tally = new UdpTally("test", "channel")
        expect(CommandCreator.createStateCommand(tally, ["channel"], ["other-channel"], defaultConfig)).toStartWith("on-air ")
    })
    test('it shows ON-AIR if channel is in preview and on-air', () => {
        const tally = new UdpTally("test", "channel")
        expect(CommandCreator.createStateCommand(tally, ["channel"], ["channel"], defaultConfig)).toStartWith("on-air ")
    })
    test('it shows RELEASE if tally is patched and it is not on-air or in preview', () => {
        const tally = new UdpTally("test", "channel")
        expect(CommandCreator.createStateCommand(tally, ["other-channel"], [], defaultConfig)).toStartWith("release ")
    })
    test('it shows RELEASE if tally is not patched', () => {
        const tally = new UdpTally("test")
        expect(CommandCreator.createStateCommand(tally, ["other-channel"], ["channel"], defaultConfig)).toStartWith("release ")
    })
    test('it shows UNKNOWN if program is null and tally is patched', () => {
        const tally = new UdpTally("test", "channel")
        expect(CommandCreator.createStateCommand(tally, null, null, defaultConfig)).toStartWith("unknown ")
    })
    test('it shows RELEASE if program is null and tally is NOT patched', () => {
        const tally = new UdpTally("test")
        expect(CommandCreator.createStateCommand(tally, null, null, defaultConfig)).toStartWith("release ")
    })

    test('it sends individual settings', () => {
        const tally = new UdpTally("test", "channel")
        tally.configuration.setStageLightBrightness(21)
        tally.configuration.setOperatorLightBrightness(42)

        const command = CommandCreator.createStateCommand(tally, [], [], defaultConfig) + " "
        expect(command).toInclude(" sb=21 ")
        expect(command).toInclude(" ob=42 ")
    })

    test('it uses default settings if tally does not override them', () => {
        const tally = new UdpTally("test", "channel")
        const defaultConfig = new DefaultTallyConfiguration()
        defaultConfig.setStageLightBrightness(21)
        defaultConfig.setOperatorLightBrightness(42)

        const command = CommandCreator.createStateCommand(tally, [], [], defaultConfig) + " "
        expect(command).toInclude(" sb=21 ")
        expect(command).toInclude(" ob=42 ")
    })

    test('it can turn the stage light completely off for a single tally', () => {
        const tally = new UdpTally("test", "channel")
        tally.configuration.setStageLightBrightness(0)
        tally.configuration.setOperatorLightBrightness(20)
        const defaultConfig = new DefaultTallyConfiguration()
        defaultConfig.setStageLightBrightness(100)
        defaultConfig.setOperatorLightBrightness(100)

        const command = CommandCreator.createStateCommand(tally, [], [], defaultConfig) + " "
        expect(command).toInclude(" sb=0 ")
        expect(command).toInclude(" ob=20 ")
    })
})
