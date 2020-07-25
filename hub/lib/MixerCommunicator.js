/* helper so that video mixer connectors do not need to implement events */

class MixerCommunicator {
    constructor(configuration, emitter) {
        this.configuration = configuration
        this.emitter = emitter
    }

    notifyProgramChanged(programs, previews) {
        this.emitter.emit('program.changed', programs, previews)
    }

    notifyMixerIsConnected() {
        this.emitter.emit('mixer.connected')
    }

    notifyMixerIsDisconnected() {
        this.emitter.emit('mixer.disconnected')
    }
}

module.exports = MixerCommunicator
