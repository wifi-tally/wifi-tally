const AtemConnector = require('./AtemConnector.js')
const VmixConnector = require('./VmixConnector.js')
const MockConnector = require('./MockConnector.js')
const NullConnector = require('./NullConnector.js')
const MixerCommunicator = require('./MixerCommunicator.js')

class MixerDriver {
    constructor(configuration, emitter) {
        this.currentMixerId
        this.currentMixerInstance
        this.currentMixerSettings
        this.getCurrentMixerSettings

        this.configuration = configuration
        this.communicator = new MixerCommunicator(configuration, emitter)
        this.emitter = emitter

        this.currentPrograms = null
        this.currentPreviews = null

        this.changeMixer(configuration.getMixerSelection())

        this.emitter.on('program.changed', (programs, previews) => {
            this.currentPrograms = programs
            this.currentPreviews = previews
        })

        this.emitter.on('config.changed', () => {
            var needsRefresh = false
            if(configuration.getMixerSelection() !== this.currentMixerId) {
                // a different mixer was selected
                console.debug("A different mixer was selected")
                needsRefresh = true
            } else if (this.getCurrentMixerSettings) {
                const mixerSettings = this.getCurrentMixerSettings()
                if (this.currentMixerSettings.length != mixerSettings.length) {
                    // a new setting was added (not sure why this would happen, but definitely a reason to restart)
                    console.debug("mixer connection is restarted, because number of settings were changed")
                    needsRefresh = true
                } else {
                    const anyChanges = this.currentMixerSettings.some((value, idx) => {
                        return value != mixerSettings[idx]
                    })
                    if (anyChanges) {
                        console.debug("mixer connection is restarted, because settings were changed")
                        needsRefresh = true
                    }
                }
            }
            if (needsRefresh) {
                this.changeMixer(configuration.getMixerSelection())
            } else {
                console.debug("settings where changed, but no need to restart mixer")
            }
        })
    }

    async changeMixer(newMixerId) {
        if(!MixerDriver.getAllowedMixers(this.configuration.isDev()).includes(newMixerId)) {
            console.error("Can not switch to unknown mixer with id " + newMixerId)
            return
        }
        if(this.currentMixerInstance) {
            this.communicator.notifyProgramChanged(null, null)
            const ret = this.currentMixerInstance.disconnect()
            await Promise.resolve(ret)
        }

        console.log("Using mixer configuration \"" + newMixerId + "\"")

        var MixerClass
        if(newMixerId == AtemConnector.ID) {
            this.getCurrentMixerSettings = () => [this.configuration.getAtemIp(), this.configuration.getAtemPort()]
            MixerClass = AtemConnector
        } else if(newMixerId == VmixConnector.ID) {
            this.getCurrentMixerSettings = () => [this.configuration.getVmixIp(), this.configuration.getVmixPort()]
            MixerClass = VmixConnector
        } else if(newMixerId == MockConnector.ID) {
            this.getCurrentMixerSettings = () => [this.configuration.getMockTickTime()]
            MixerClass = MockConnector
        } else if(newMixerId == NullConnector.ID) {
            this.getCurrentMixerSettings = () => []
            MixerClass = NullConnector
        } else {
            console.error("Someone(TM) forgot to implement the " + newMixerId + " mixer in MixerDriver.js.")
            return
        }
        this.currentMixerId = newMixerId
        this.currentMixerSettings = this.getCurrentMixerSettings()
        this.currentMixerInstance = new MixerClass(...this.currentMixerSettings, this.communicator)
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