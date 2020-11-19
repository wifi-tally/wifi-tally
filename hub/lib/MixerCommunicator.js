/* helper so that video mixer connectors do not need to implement events */

const Channel = require("../domain/Channel")

const haveValuesChanged = (lastArray, newArray) => {
    if(Array.isArray(lastArray) && Array.isArray(newArray)) {
        return lastArray.length !== newArray.length || lastArray.some((value, index) => value !== newArray[index])
    } else {
        return lastArray !== newArray
    }
}

const isSame = (one, two) => {
    if (typeof one !== typeof two) {
        return false
    } else if (typeof one === "object") {
        const keyOne = Object.keys(one)
        const keyTwo = Object.keys(two)
        if (keyOne.length !== keyTwo.length) {
            return false
        }
        for (const [k, v] of Object.entries(one)) {
            if (two[k] !== v) {
                return false
            }
        }
        return true
    } else {
        return one === two
    }
}

class MixerCommunicator {
    constructor(configuration, emitter) {
        this.configuration = configuration
        this.emitter = emitter

        this.currentPrograms = null
        this.currentPreviews = null
        this.currentConnection = null
    }

    notifyProgramChanged(programs, previews) {
        // @TODO: type check
        if (haveValuesChanged(programs, this.currentPrograms) || haveValuesChanged(previews, this.currentPreviews)) {
            this.currentPrograms = programs
            this.currentPreviews = previews

            this.emitter.emit('program.changed', programs, previews)
        }
    }

    notifyChannelNames(count, names) {
        if (count === null) {
            this.notifyChannels(null)
        } else {
            names = names || {}
            
            // empty array with `count` elements.
            // `fill` is necessary, because Array() does not fill the array with anything - not even `undefined` ¯\_(ツ)_/¯
            const range = Array(count).fill(null)
            
            const channels = range.map((_,i) => {
                const name = names[i+1]
                return new Channel(i+1, name)
            })

            this.notifyChannels(channels)
        }
    }

    notifyChannels(channels) {
        channels = channels || []
        if (JSON.stringify(channels.map(c => c.toValueObject())) !== JSON.stringify(this.configuration.getChannels().map(c => c.toValueObject()))) {
            this.configuration.setChannels(channels)
            this.configuration.save()

            this.emitter.emit("config.changed")
        }
    }

    notifyMixerIsConnected() {
        if (this.currentConnection !== true) {
            this.currentConnection = true
            this.emitter.emit('mixer.connected')
        }
    }

    notifyMixerIsDisconnected() {
        if (this.currentConnection !== false) {
            this.currentConnection = false
            this.emitter.emit('mixer.disconnected')
        }
    }

    getCurrentPrograms() {
        return this.currentPrograms
    }

    getCurrentPreviews() {
        return this.currentPreviews
    }
}

module.exports = MixerCommunicator
