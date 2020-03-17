const fs = require('fs');
const MixerDriver = require('./MixerDriver')
const AtemConnector = require('./AtemConnector')
const MockConnector = require('./MockConnector')

class Configuration {
    constructor(configFileName, emitter) {
        this.emitter = emitter
        this.atemIp
        this.atemPort
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

        this.emitter.emit("config.changed.atem")

        this.save()
    }

    updateTallies(tallyDriver) {
        this.tallies = tallyDriver.toValueObjectsForSave()

        this.save()
    }

    updateMixerSelection(mixerSelection) {
        this.mixerSelection = mixerSelection

        this.emitter.emit("config.changed.mixer", mixerSelection)

        this.save()
    }

    updateMockConfig(mockTickTime) {
        this.mockTickTime = mockTickTime

        this.emitter.emit("config.changed.mock")

        this.save()
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
            mock: {
                tickTime: this.getMockTickTime(),
            },
        }
    }
}

module.exports = Configuration;