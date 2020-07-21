const AtemConnector = require('./AtemConnector.js')
const VmixConnector = require('./VmixConnector.js')
const MockConnector = require('./MockConnector.js')
const NullConnector = require('./NullConnector.js')

class MixerDriver {
    constructor(configuration, emitter) {
        this.currentMixerId
        this.currentMixerInstance

        this.configuration = configuration
        this.emitter = emitter

        this.currentPrograms = null
        this.currentPreviews = null

        this.changeMixer(configuration.getMixerSelection())

        this.emitter.on('program.changed', (programs, previews) => {
            this.currentPrograms = programs
            this.currentPreviews = previews
        })

        this.emitter.on('config.changed.atem', () => {
            if(this.currentMixerId == AtemConnector.ID) {
                console.log("Atem changed")
                this.changeMixer(AtemConnector.ID)
            }
        })
        this.emitter.on('config.changed.vmix', () => {
            if(this.currentMixerId == VmixConnector.ID) {
                console.log("Vmix changed")
                this.changeMixer(VmixConnector.ID)
            }
        })
        this.emitter.on('config.changed.mock', () => {
            if(this.currentMixerId == MockConnector.ID) {
                console.log("Mock changed")
                this.changeMixer(MockConnector.ID)
            }
        })
        this.emitter.on('config.changed.mixer', () => {
            console.log("Mixer changed")
            this.changeMixer(this.configuration.getMixerSelection())
        })
    }

    async changeMixer(newMixerId) {
        if(!MixerDriver.getAllowedMixers(this.configuration.isDev()).includes(newMixerId)) {
            console.error("Can not switch to unknown mixer with id " + newMixerId)
            return
        }
        if(this.currentMixerInstance) {
            this.emitter.emit("program.changed", null, null)
            const ret = this.currentMixerInstance.disconnect()
            await Promise.resolve(ret)
        }

        console.log("Using mixer configuration \"" + newMixerId + "\"")

        this.currentMixerId = newMixerId
        if(newMixerId == AtemConnector.ID) {
            this.currentMixerInstance = new AtemConnector(this.configuration.getAtemIp(), this.configuration.getAtemPort(), this.emitter)
        } else if(newMixerId == VmixConnector.ID) {
            this.currentMixerInstance = new VmixConnector(this.configuration.getVmixIp(), this.configuration.getVmixPort(), this.emitter)
        } else if(newMixerId == MockConnector.ID) {
            this.currentMixerInstance = new MockConnector(this.configuration.getMockTickTime(), this.emitter)
        } else if(newMixerId == NullConnector.ID) {
            this.currentMixerInstance = new NullConnector(this.emitter)
        } else {
            console.error("Someone(TM) forgot to implement the " + newMixerId + " mixer in MixerDriver.js.")
            return
        }
        const ret = this.currentMixerInstance.connect()
        await Promise.resolve(ret)
    }

    getCurrentPrograms() {
        return this.currentPrograms
    }

    getCurrentPreviews() {
        return this.currentPreviews
    }
    isConnected() {
        return this.currentMixerInstance && this.currentMixerInstance.isConnected()
    }
}

MixerDriver.getAllowedMixers = function(isDev) {
    const mixers = [
        NullConnector.ID,
        AtemConnector.ID,
        VmixConnector.ID,
    ]

    if (isDev) {
        mixers.unshift(MockConnector.ID)
    }

    return mixers
}

MixerDriver.getDefaultMixerId = function(isDev) {
    return MixerDriver.getAllowedMixers(isDev)[0];
}

MixerDriver.isValidMixerId = function(name, isDev) {
    return MixerDriver.getAllowedMixers(isDev).includes(name)
}

module.exports = MixerDriver