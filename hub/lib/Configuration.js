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
        this.mockChannelCount
        this.mockChannelNames
        this.tallies = []
        this.channelCount = MixerDriver.defaultChannelCount
        this.channelNames = MixerDriver.defaultChannelNames
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
            if(config.mock && config.mock.channelCount) {
                this.mockChannelCount = config.mock.channelCount
            }
            if(config.mock && config.mock.channelNames) {
                this.mockChannelNames = config.mock.channelNames
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
                channelCount: this.mockChannelCount,
                channelNames: this.mockChannelNames,
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
        this.vmixPort = parseInt(vmixPort, 10)
    }

    updateTallies(tallyDriver) {
        this.tallies = tallyDriver.toValueObjectsForSave()
    }

    updateMixerSelection(mixerSelection) {
        this.mixerSelection = mixerSelection
    }

    updateMockConfig(mockTickTime, mockChannelCount, mockChannelNames) {
        this.mockTickTime = parseInt(mockTickTime, 10)
        this.mockChannelCount = parseInt(mockChannelCount, 10)
        this.mockChannelNames = mockChannelNames
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

    getMockChannelCount() {
        return this.mockChannelCount || MockConnector.defaultChannelCount
    }

    getMockChannelNames() {
        return this.mockChannelNames || MockConnector.defaultChannelNames
    }

    getMixerSelection() {
        if (this.mixerSelection && MixerDriver.isValidMixerId(this.mixerSelection, this.isDev())) {
            return this.mixerSelection
        } else {
            return MixerDriver.getDefaultMixerId(this.isDev())
        }
    }

    getChannelCount() {
        return this.channelCount
    }

    setChannelCount(count) {
        this.channelCount = parseInt(count, 10) || MixerDriver.defaultChannelCount
    }

    getChannelNames() {
        return this.channelNames
    }

    setChannelNames(names) {
        this.channelNames = names || MixerDriver.defaultChannelNames
    }

    mixerConfigToObject() {
        return {
            currentMixerId: this.getMixerSelection(),
            atem: {
                ip: this.getAtemIp(),
                port: this.getAtemPort(),
            },
            channels: {
                count: this.getChannelCount(),
                names: this.getChannelNames(),
            },
            vmix: {
                ip: this.getVmixIp(),
                port: this.getVmixPort(),
            },
            mock: {
                tickTime: this.getMockTickTime(),
                channelCount: this.getMockChannelCount(),
                channelNames: this.getMockChannelNames(),
            },
        }
    }
}

module.exports = Configuration;