import Channel from '../../domain/Channel'
import {Configuration} from '../interfaces'

export type MockConfigurationSaveType = {
    channelCount: number
    channelNames: string[]
    tickTime: number
}

class MockConfiguration extends Configuration {
    channelCount: number
    channelNames: string[]
    tickTime: number

    constructor() {
        super()
        this.channelCount = MockConfiguration.defaultChannelCount
        this.channelNames = MockConfiguration.defaultChannelNames
        this.tickTime = MockConfiguration.defaultTickTime
    }

    protected loadStringArray(fieldName: string, setter: (value:string[]|string) => void, data: object) {
        const value = data[fieldName]
        const isStringArray = (data: unknown) => {
            if (!Array.isArray(data)) {
                return false
            }
            return data.every(value => typeof value === "string")
        }
        if (value === undefined || value === null) {
            // value is not set
            return
        } else if (typeof value === "string" || isStringArray(value)) {
            try {
                setter(value)
            } catch (err) {
                console.error(`error loading property "${fieldName}" of configuration: ${err}`)
                return
            }
        } else {
            console.error(`error loading property "${fieldName}": invalid type ${typeof value}`)
        }
    }

    fromJson(data: MockConfigurationSaveType): void {
        this.loadNumber("channelCount", this.setChannelCount.bind(this), data)
        this.loadStringArray("channelNames", this.setChannelNames.bind(this), data)
        this.loadNumber("tickTime", this.setTickTime.bind(this), data)
    }
    toJson(): MockConfigurationSaveType {
        return {
            channelCount: this.channelCount,
            channelNames: this.channelNames,
            tickTime: this.tickTime
        }
    }
    clone(): MockConfiguration {
        const clone = new MockConfiguration()
        clone.fromJson(this.toJson())
        return clone
    }

    setTickTime(time: number|string|null) {
        let theTime: number
        if (typeof time === "string") {
            time = parseInt(time, 10)
            if(!Number.isFinite(time)) {
                throw `Could not parse "${time}" into a number.`
            }
        }
        if (typeof time === "number") {
            theTime = time
        } else {
            theTime = MockConfiguration.defaultTickTime
        }
        if (theTime <= 0) {
            throw `tickTime needs to be a positive number, but got ${theTime}`
        }

        this.tickTime = theTime
        
        return this
    }
    getTickTime(): number {
        return this.tickTime
    }

    setChannelCount(count: number|string|null) {
        if (typeof count === "string") {
            count = parseInt(count, 10)
            if(!Number.isFinite(count)) {
                throw `Could not parse "${count}" into a number.`
            }
        }
        if (typeof count === "number") {
            if (count < 0) {
                throw `channel count needs to be a positive integer, but got ${count}`
            }
            if (!Number.isInteger(count)) {
                throw `channel count needs to be an integer, but got ${count}`
            }
            this.channelCount = count
        } else if (count === null) {
            this.channelCount = MockConfiguration.defaultChannelCount
        }
        
        return this
    }
    setChannelNames(names: string[]|string|null) {
        if (typeof names === "string") {
            names = names.split(",")
        } else if (names === null) {
            names = MockConfiguration.defaultChannelNames
        }
        this.channelNames = names.map(name => name.trim())
        
        return this
    }
    getChannelNames() {
        const result = this.getChannels().filter(c => c.name).map(c => c.name)
        result.toString = () => result.join(", ")
        return result
    }
    getChannelCount() {
        return this.channelCount
    }
    getChannels() : Channel[] {
        return Array(this.channelCount).fill(null).map((_,i) => {
            return new Channel((i+1).toString(), this.channelNames[i])
        })
    }

    private static readonly defaultTickTime = 3000
    private static readonly defaultChannelCount = 8
    private static readonly defaultChannelNames = []
}

export default MockConfiguration
