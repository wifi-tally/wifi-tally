/* helper so that video mixer connectors do not need to implement events */

const haveValuesChanged = (lastArray, newArray) => {
    if(Array.isArray(lastArray) && Array.isArray(newArray)) {
        return lastArray.length !== newArray.length || lastArray.some((value, index) => value !== newArray[index])
    } else {
        return lastArray !== newArray
    }
}

const isSame = (one, two) => {
    if (typeof one != typeof two) {
        return false
    } else if (typeof one == "object") {
        const keyOne = Object.keys(one)
        const keyTwo = Object.keys(two)
        if (keyOne.length != keyTwo.length) {
            return false
        }
        for (const [k, v] of Object.entries(one)) {
            if (two[k] != v) {
                return false
            }
        }
        return true
    } else {
        return one == two
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

    notifyChannels(count, names) {
        // @TODO: type check
        if (count != this.configuration.getChannelCount() || (names && !isSame(names, this.configuration.getChannelNames()))) {
            this.configuration.setChannelCount(count)
            this.configuration.setChannelNames(names)
            this.configuration.save()

            this.emitter.emit("config.changed")
        }
    }

    notifyMixerIsConnected() {
        if (this.currentConnection != true) {
            this.currentConnection = true
            this.emitter.emit('mixer.connected')
        }
    }

    notifyMixerIsDisconnected() {
        if (this.currentConnection != false) {
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
