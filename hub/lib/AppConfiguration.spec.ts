import { AppConfiguration } from './AppConfiguration'
import { EventEmitter } from 'events'
import Channel from '../domain/Channel'
import AtemConfiguration from '../mixer/atem/AtemConfiguration'
import MockConfiguration from '../mixer/mock/MockConfiguration'
import ObsConfiguration from '../mixer/obs/ObsConfiguration'
import VmixConfiguration from '../mixer/vmix/VmixConfiguration'
import Tally from '../domain/Tally'

describe("toSave/fromSave", () => {
    test('it can persist atem configuration', () => {
        const emitter = new EventEmitter()
        const config = new AppConfiguration(emitter)
        const atemConfig = new AtemConfiguration()
        atemConfig.setIp("10.1.1.42")
        config.setAtemConfiguration(atemConfig)

        const otherConfig = new AppConfiguration(emitter)
        otherConfig.fromSave(config.toSave())

        expect(otherConfig.getAtemConfiguration().getIp().toString()).toEqual("10.1.1.42")
    })
    test('it can persist mock configuration', () => {
        const emitter = new EventEmitter()
        const config = new AppConfiguration(emitter)
        const mockConfig = new MockConfiguration()
        mockConfig.setChannelCount(42)
        config.setMockConfiguration(mockConfig)

        const otherConfig = new AppConfiguration(emitter)
        otherConfig.fromSave(config.toSave())

        expect(otherConfig.getMockConfiguration().getChannelCount()).toEqual(42)
    })
    test.skip('it can persist null configuration', done => {
        // it is empty -> so it does not really matter
    })
    test('it can persist obs configuration', () => {
        const emitter = new EventEmitter()
        const config = new AppConfiguration(emitter)
        const obsConfig = new ObsConfiguration()
        obsConfig.setIp("10.1.1.43")
        config.setObsConfiguration(obsConfig)

        const otherConfig = new AppConfiguration(emitter)
        otherConfig.fromSave(config.toSave())

        expect(otherConfig.getObsConfiguration().getIp().toString()).toEqual("10.1.1.43")
    })
    test('it can persist vmix configuration', () => {
        const emitter = new EventEmitter()
        const config = new AppConfiguration(emitter)
        const vmixConfig = new VmixConfiguration()
        vmixConfig.setIp("10.1.1.44")
        config.setVmixConfiguration(vmixConfig)

        const otherConfig = new AppConfiguration(emitter)
        otherConfig.fromSave(config.toSave())

        expect(otherConfig.getVmixConfiguration().getIp().toString()).toEqual("10.1.1.44")

    })
    test('it can persist mixer selection', () => {
        const emitter = new EventEmitter()
        const config = new AppConfiguration(emitter)
        config.setMixerSelection('atem')

        const otherConfig = new AppConfiguration(emitter)
        otherConfig.fromSave(config.toSave())

        expect(otherConfig.getMixerSelection()).toEqual('atem')
    })
    test('it can persist tallies', () => {
        const emitter = new EventEmitter()
        const config = new AppConfiguration(emitter)
        config.setTallies([
            new Tally("Tally 01", "Channel One"),
            new Tally("Tally 02"),
        ])

        const otherConfig = new AppConfiguration(emitter)
        otherConfig.fromSave(config.toSave())

        const tallies = otherConfig.getTallies()
        expect(tallies[0]?.name).toEqual("Tally 01")
        expect(tallies[0]?.channelId).toEqual("Channel One")
        expect(tallies[1]?.name).toEqual("Tally 02")
        expect(tallies[1]?.channelId).toBeFalsy()
    })
    test('it can persist channels', () => {
        const emitter = new EventEmitter()
        const config = new AppConfiguration(emitter)
        config.setChannels([
            new Channel("one", "Channel One"),
            new Channel("2"),
        ])

        const otherConfig = new AppConfiguration(emitter)
        otherConfig.fromSave(config.toSave())

        const channels = otherConfig.getChannels()
        expect(channels[0]?.id).toEqual("one")
        expect(channels[0]?.name).toEqual("Channel One")
        expect(channels[1]?.id).toEqual("2")
    })
})
