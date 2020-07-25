/* helper so that video mixer connectors do not need to implement events */

class MixerCommunicator {
    constructor(configuration, emitter) {
        this.configuration = configuration
        this.emitter = emitter
    }

    notifyProgramChanged(programs, previews) {
        // @TODO: type check
        this.emitter.emit('program.changed', programs, previews)
    }

    notifyChannels(count, names) {
        // @TODO: type check
        this.configuration.setChannelCount(count)
        this.configuration.setChannelNames(names)
        this.configuration.save()

        this.emitter.emit("config.changed")
    }

    notifyMixerIsConnected() {
        this.emitter.emit('mixer.connected')
    }

    notifyMixerIsDisconnected() {
        this.emitter.emit('mixer.disconnected')
    }
}

module.exports = MixerCommunicator
