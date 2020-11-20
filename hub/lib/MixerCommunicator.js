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

    _changeProgramsIfNecessary(programs) {
        programs = programs ? programs.map(v => v.toString()) : null
        if (haveValuesChanged(programs, this.currentPrograms)) {
            this.currentPrograms = programs
            return true
        } else {
            return false
        }
    }

    _changePreviewsIfNecessary(previews) {
        previews = previews ? previews.map(v => v.toString()) : null
        if (haveValuesChanged(previews, this.currentPreviews)) {
            this.currentPreviews = previews
            return true
        } else {
            return false
        }
    }

    notifyProgramPreviewChanged(programs, previews) {
        const programChanged = this._changeProgramsIfNecessary(programs)
        const previewChanged = this._changePreviewsIfNecessary(previews)
        if (previewChanged || programChanged) {
            this.emitter.emit('program.changed', { programs: this.currentPrograms, previews: this.currentPreviews })
        }
    }

    notifyProgramChanged(programs) {
        const programChanged = this._changeProgramsIfNecessary(programs)
        if (programChanged) {
            this.emitter.emit('program.changed', { programs: this.currentPrograms, previews: this.currentPreviews })
        }
    }

    notifyPreviewChanged(previews) {
        const previewChanged = this._changePreviewsIfNecessary(previews)
        if (previewChanged) {
            this.emitter.emit('program.changed', { programs: this.currentPrograms, previews: this.currentPreviews })
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
