const fs = require('fs')
const os = require('os')
const MixerDriver = require('./MixerDriver')
const AtemConnector = require('./AtemConnector')
const ObsConnector = require('./ObsConnector')
const VmixConnector = require('./VmixConnector')
const MockConnector = require('./MockConnector')
const {channelFromValueObject} = require('../domain/Channel')

class Configuration {
    constructor(emitter) {
        this.emitter = emitter
        this.atemIp
        this.atemPort
        this.obsIp
        this.obsPort
        this.vmixIp
        this.vmixPort
        this.mockTickTime
        this.mockChannelCount
        this.mockChannelNames
        this.tallies = []
        this.channels = MixerDriver.defaultChannels
        this.mixerSelection = null
        this.configFileName = this.getConfigFilePath()
        this.load()
    }

    getConfigFilePath() {
        return process.env.CONFIG_FILE || (os.homedir() + "/.wifi-tally.json")
    }

    load() {
        if(fs.existsSync(this.configFileName)) {
            const rawdata = fs.readFileSync(this.configFileName)
            try {
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
                if(config.obs && config.obs.ip) {
                    this.obsIp = config.obs.ip
                }
                if(config.obs && config.obs.port) {
                    this.obsPort = config.obs.port
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
                if(Array.isArray(config.channels)) {
                    this.channels = config.channels.map(vo => channelFromValueObject(vo))
                }
            } catch (e) {
                if (e instanceof SyntaxError && rawdata.byteLength === 0) {
                    console.warn(`Could not parse ${this.configFileName}, because file is empty. Using defaults.`)
                } else { 
                    console.error(`Error when parsing ${this.configFileName}`)
                    throw e 
                }
            }
        } else {
            console.warn(`Configuration File ${this.configFileName} does not exist. Using defaults.`)
        }
    }

    async save() {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.configFileName, JSON.stringify({
                _warning: "This file was automatically generated.",
                _warning2: "Do not edit it while the hub is running. Your changes will be lost.",
                mixer: this.mixerSelection,
                atem: {
                    ip: this.atemIp,
                    port: this.atemPort,
                },
                obs: {
                    ip: this.obsIp,
                    port: this.obsPort,
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
                channels: this.channels.map(channel => channel.toValueObject()),
            }, null, '\t'), err => {
                if(err) {
                    console.error(err)
                    reject()
                } else {
                    resolve()
                }
            })
        })
    }

    updateAtemConfig(atemIp, atemPort) {
        this.atemIp = atemIp
        this.atemPort = atemPort
    }

    updateObsConfig(obsIp, obsPort) {
        this.obsIp = obsIp
        this.obsPort = obsPort
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
        return process.env.NODE_ENV !== 'production'
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

    getObsIp() {
        return this.obsIp || ObsConnector.defaultIp
    }

    getObsPort() {
        return this.obsPort || ObsConnector.defaultPort
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

    setChannels(channels) {
        this.channels = channels
    }
    
    getChannels() {
        return this.channels
    }

    mixerConfigToObject() {
        return {
            currentMixerId: this.getMixerSelection(),
            atem: {
                ip: this.getAtemIp(),
                port: this.getAtemPort(),
            },
            channels: this.channels.map(channel => channel.toValueObject()),
            obs: {
                ip: this.getObsIp(),
                port: this.getObsPort(),
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