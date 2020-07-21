const fs = require('fs');
const MixerDriver = require('./MixerDriver')
const AtemConnector = require('./AtemConnector')
const VmixConnector = require('./VmixConnector')
const MockConnector = require('./MockConnector')

class Configuration {
    constructor(configFileName, emitter) {
        this.emitter = emitter
        this.atemIp
        this.atemPort
        this.vmixIp
        this.vmixPort
        this.mockTickTime
        this.tallies = []
        this.mixerSelection = null
        this.configFileName = configFileName
        if(fs.existsSync(this.configFileName)) {
            const rawdata = fs.readFileSync(this.configFileName)
            const config = JSON.parse(rawdata)
            if(config.tallies) {
                this.tallies = config.tallies
            }
            if(config.atem && config.atem.ip) {
                this.atemIp = config.atem.ip
            }
            if(config.atem && config.atem.port) {
                this.atemPort = config.atem.port
            }
            if(config.vmix && config.vmix.ip) {
                this.vmixIp = config.vmix.ip
            }
            if(config.vmix && config.vmix.port) {
                this.vmixPort = config.vmix.port
            }
            if(config.mixer) {
                this.mixerSelection = config.mixer
            }
            if(config.mock && config.mock.tickTime) {
                this.mockTickTime = config.mock.tickTime
            }
        } else {
            console.log("Configuration File " + this.configFileName + " does not exist.")
        }
    }

    save() {
        fs.writeFile(this.configFileName, JSON.stringify({
            _warning: "This file was automatically generated.",
            _warning2: "Do not edit it while the hub is running. Your changes will be lost.",
            mixer: this.mixerSelection,
            atem: {
              ip: this.atemIp,
              port: this.atemPort,
            },
            vmix: {
              ip: this.vmixIp,
              port: this.vmixPort,
            },
            mock: {
                tickTime: this.mockTickTime,
            },
            tallies: this.tallies,
          }, null, '\t'), err => {
            if(err) { console.error(err) }
          })
    }

    updateAtemConfig(atemIp, atemPort) {
        this.atemIp = atemIp
        this.atemPort = atemPort
    }

    updateVmixConfig(vmixIp, vmixPort) {
        this.vmixIp = vmixIp
        this.vmixPort = vmixPort
    }

    updateTallies(tallyDriver) {
        this.tallies = tallyDriver.toValueObjectsForSave()
    }

    updateMixerSelection(mixerSelection) {
        this.mixerSelection = mixerSelection
    }

    updateMockConfig(mockTickTime) {
        this.mockTickTime = mockTickTime
    }

    isDev() {
        return process.env.NODE_ENV === 'dev'
    }

    getHttpPort() {
        return parseInt(process.env.PORT, 10) || 3000
    }

    getTallies() {
        return this.tallies
    }

    getAtemIp() {
        return this.atemIp || AtemConnector.defaultIp
    }

    getAtemPort() {
        return this.atemPort || AtemConnector.defaultPort
    }

    getVmixIp() {
        return this.vmixIp || VmixConnector.defaultIp
    }

    getVmixPort() {
        return this.vmixPort || VmixConnector.defaultPort
    }

    getMockTickTime() {
        return this.mockTickTime || MockConnector.defaultTickTime
    }

    getMixerSelection() {
        if (this.mixerSelection && MixerDriver.isValidMixerId(this.mixerSelection, this.isDev())) {
            return this.mixerSelection
        } else {
            return MixerDriver.getDefaultMixerId(this.isDev())
        }
    }

    mixerConfigToObject() {
        return {
            currentMixerId: this.getMixerSelection(),
            atem: {
                ip: this.getAtemIp(),
                port: this.getAtemPort(),
            },
            vmix: {
                ip: this.getVmixIp(),
                port: this.getVmixPort(),
            },
            mock: {
                tickTime: this.getMockTickTime(),
            },
        }
    }
}

module.exports = Configuration;