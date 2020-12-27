import {MixerDriver} from './MixerDriver'
import Channel from '../domain/Channel'
import ServerEventEmitter from './ServerEventEmitter'
import AtemConfiguration from '../mixer/atem/AtemConfiguration'
import MockConfiguration from '../mixer/mock/MockConfiguration'
import ObsConfiguration from '../mixer/obs/ObsConfiguration'
import VmixConfiguration from '../mixer/vmix/VmixConfiguration'
import NullConfiguration from '../mixer/null/NullConfiguration'
import { Configuration } from '../mixer/interfaces'
import Tally from '../domain/Tally'
import TestConfiguration from '../mixer/test/TestConfiguration'

export class AppConfiguration extends Configuration {
    emitter: ServerEventEmitter
    atemConfiguration: AtemConfiguration
    mockConfiguration: MockConfiguration
    nullConfiguration: NullConfiguration
    obsConfiguration: ObsConfiguration
    testConfiguration: TestConfiguration
    vmixConfiguration: VmixConfiguration
    tallies: Tally[]
    channels: Channel[]
    mixerSelection?: string
    tallyPort: number
    tallyHighlightTime: number
    tallyKeepAlivesPerSecond: number
    tallyTimeoutDisconnected: number
    tallyTimeoutMissing: number
    
    constructor(emitter: ServerEventEmitter) {
        super()
        this.emitter = emitter
        this.atemConfiguration = new AtemConfiguration()
        this.mockConfiguration = new MockConfiguration()
        this.nullConfiguration = new NullConfiguration()
        this.obsConfiguration = new ObsConfiguration()
        this.testConfiguration = new TestConfiguration()
        this.vmixConfiguration = new VmixConfiguration()
        this.tallies = []
        this.channels = MixerDriver.defaultChannels

        this.tallyPort = 7411
        this.tallyHighlightTime = 1000 // ms
        this.tallyKeepAlivesPerSecond = 10
        this.tallyTimeoutDisconnected = 30000 // ms
        this.tallyTimeoutMissing = 3000 //ms
    }

    protected loadChannelArray(fieldName: string, setter: (value:Channel[]) => void, data: object) {
        const value = data[fieldName]
        if (value === undefined || value === null) {
            // value is not set
            return
        } else if (Array.isArray(value)) {
            try {
                setter(value.map(c => Channel.fromJson(c)))
            } catch (err) {
                console.error(`error loading property "${fieldName}" of configuration: ${err}`)
                return
            }
        } else {
            console.error(`error loading property "${fieldName}": invalid type ${typeof value}`)
        }
    }

    protected loadTallyArray(fieldName: string, setter: (value:Tally[]) => void, data: object) {
        const value = data[fieldName]
        if (value === undefined || value === null) {
            // value is not set
            return
        } else if (Array.isArray(value)) {
            try {
                setter(value.map(t => Tally.fromJsonForSave(t)))
            } catch (err) {
                console.error(`error loading property "${fieldName}" of configuration: ${err}`)
                return
            }
        } else {
            console.error(`error loading property "${fieldName}": invalid type ${typeof value}`)
        }
    }

    fromJson(data: any): void {
        if (data.atem) {
            this.atemConfiguration.fromJson(data.atem)
        }
        if (data.mock) {
            this.mockConfiguration.fromJson(data.mock)
        }
        if (data.null) {
            this.nullConfiguration.fromJson(data.null)
        }
        if (data.obs) {
            this.obsConfiguration.fromJson(data.obs)
        }
        if (data.test) {
            this.testConfiguration.fromJson(data.test)
        }
        if (data.vmix) {
            this.vmixConfiguration.fromJson(data.vmix)
        }
        this.loadString("mixer", this.setMixerSelection.bind(this), data)
        this.loadChannelArray("channels", this.setChannels.bind(this), data)
        this.loadTallyArray("tallies", this.setTallies.bind(this), data)
    }
    toJson(): object {
        return {
            mixer: this.mixerSelection,
            atem: this.atemConfiguration.toJson(),
            mock: this.mockConfiguration.toJson(),
            "null": this.nullConfiguration.toJson(),
            obs: this.obsConfiguration.toJson(),
            test: this.testConfiguration.toJson(),
            vmix: this.vmixConfiguration.toJson(),
            tallies: this.tallies.map(tally => tally.toJsonForSave()),
            channels: this.channels.map(channel => channel.toJson()),
        }
    }
    clone(): AppConfiguration {
        const clone = new AppConfiguration(this.emitter)
        clone.fromJson(this.toJson())
        return clone
    }

    getAtemConfiguration() {
        return this.atemConfiguration.clone()
    }

    setAtemConfiguration(atemConfiguration: AtemConfiguration) {
        this.atemConfiguration = atemConfiguration.clone()
        this.emitter.emit("config.changed", this)
        this.emitter.emit("config.changed.atem", this.atemConfiguration)
    }

    getMockConfiguration() {
        return this.mockConfiguration.clone()
    }

    setMockConfiguration(mockConfiguration: MockConfiguration) {
        this.mockConfiguration = mockConfiguration.clone()
        this.emitter.emit("config.changed", this)
        this.emitter.emit("config.changed.mock", this.mockConfiguration)
    }

    getNullConfiguration() {
        return this.nullConfiguration.clone()
    }

    setNullConfiguration(nullConfiguration: NullConfiguration) {
        this.nullConfiguration = nullConfiguration.clone()
        this.emitter.emit("config.changed", this)
        this.emitter.emit("config.changed.null", this.nullConfiguration)
    }

    getObsConfiguration() {
        return this.obsConfiguration.clone()
    }

    setObsConfiguration(obsConfiguration: ObsConfiguration) {
        this.obsConfiguration = obsConfiguration.clone()
        this.emitter.emit("config.changed", this)
        this.emitter.emit("config.changed.obs", this.obsConfiguration)
    }

    getTestConfiguration() {
        return this.testConfiguration.clone()
    }

    setTestConfiguration(testConfiguration: TestConfiguration) {
        this.testConfiguration = testConfiguration.clone()
        this.emitter.emit("config.changed", this)
        this.emitter.emit("config.changed.test", this.testConfiguration)
    }

    getVmixConfiguration() {
        return this.vmixConfiguration.clone()
    }

    setVmixConfiguration(vmixConfiguration: VmixConfiguration) {
        this.vmixConfiguration = vmixConfiguration.clone()
        this.emitter.emit("config.changed", this)
        this.emitter.emit("config.changed.vmix", this.vmixConfiguration)
    }

    setChannels(channels: Channel[]) {
        this.channels = channels
        this.emitter.emit('config.changed', this)
        this.emitter.emit('config.changed.channels', this.channels)
    }
    
    getChannels() {
        return this.channels
    }
    getChannelsAsJson() {
        return this.channels.map(channel => channel.toJson())
    }

    setTallies(tallies: Tally[]) {
        this.tallies = tallies
        this.emitter.emit('config.changed', this)
        this.emitter.emit('config.changed.tallies', this.tallies)
    }
    getTallies() {
        return this.tallies
    }

    setMixerSelection(mixerSelection: string) {
        this.mixerSelection = mixerSelection
        this.emitter.emit("config.changed", this)
        this.emitter.emit("config.changed.mixer", mixerSelection)
    }
    getMixerSelection() {
        return this.mixerSelection
    }

    isDev() {
        return process.env.NODE_ENV !== 'production'
    }

    isTest() {
        return process.env.HUB_WITH_TEST === 'true'
    }

    getHttpPort() {
        return (typeof process.env.PORT === "string" && parseInt(process.env.PORT, 10)) || 3000
    }

    getTallyPort() {
        return this.tallyPort
    }

    getTallyHighlightTime() {
        return this.tallyHighlightTime
    }

    // the more keep alives you send the less likely it is that
    // the tally shows a wrong state, but you send more packages
    // over the network.
    getTallyKeepAlivesPerSecond() {
        return this.tallyKeepAlivesPerSecond
    }

    setTallyTimeoutDisconnected(timeout: number) {
        if (timeout < 1000) { throw `timeout too small: ${timeout}ms` }
        this.tallyTimeoutDisconnected = timeout
    }

    getTallyTimeoutDisconnected() {
        return this.tallyTimeoutDisconnected
    }

    setTallyTimeoutMissing(timeout: number) {
        if (timeout < 1000) { throw `timeout too small: ${timeout}ms` }
        this.tallyTimeoutMissing = timeout
    }

    getTallyTimeoutMissing() {
        return this.tallyTimeoutMissing
    }
}