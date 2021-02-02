import AtemConnector from '../mixer/atem/AtemConnector'
import VmixConnector from '../mixer/vmix/VmixConnector'
import MockConnector from '../mixer/mock/MockConnector'
import NullConnector from '../mixer/null/NullConnector'
import ObsConnector from '../mixer/obs/ObsConnector'
import { MixerCommunicator } from './MixerCommunicator'
import Channel from '../domain/Channel'
import type { AppConfiguration } from './AppConfiguration'
import ServerEventEmitter from './ServerEventEmitter'
import { Configuration, Connector } from '../mixer/interfaces'
import TestConnector from '../mixer/test/TestConnector'
import WirecastConnector from '../mixer/wirecast/WirecastConnector'

const haveValuesChanged = (one: any, two: any) => {
    //@TODO: this could probably be more performant
    return JSON.stringify(one) !== JSON.stringify(two)
}

// Takes care of connecting to one of the supported mixers
export class MixerDriver {
    currentMixerId?: string
    currentMixerInstance?: Connector
    currentMixerSettings?: Configuration
    getCurrentMixerSettings?: () => Configuration
    configuration: AppConfiguration
    communicator: MixerCommunicator
    emitter: ServerEventEmitter
    isChangingMixer: boolean
    
    constructor(configuration: AppConfiguration, emitter: ServerEventEmitter) {
        this.configuration = configuration
        this.communicator = new MixerCommunicator(configuration, emitter)
        this.emitter = emitter

        this.isChangingMixer = false

        this.changeMixer(configuration.getMixerSelection())

        this.emitter.on('config.changed', () => {
            if (this.isChangingMixer) {
                return
            }
            let needsRefresh = false
            if(configuration.getMixerSelection() !== this.currentMixerId) {
                // a different mixer was selected
                console.debug("A different mixer was selected")
                needsRefresh = true
            } else if (this.getCurrentMixerSettings && this.currentMixerSettings) {
                const mixerSettings = this.getCurrentMixerSettings()
                if (haveValuesChanged(mixerSettings.toJson(), this.currentMixerSettings.toJson()) ){
                    console.debug("mixer connection is restarted, because settings were changed")
                    needsRefresh = true
                }
            }
            if (needsRefresh) {
                this.changeMixer(configuration.getMixerSelection())
            } else {
                console.debug("settings were changed, but no need to restart mixer")
            }
        })
    }

    async changeMixer(newMixerId) {
        if(!MixerDriver.getAllowedMixers(this.configuration.isDev(), this.configuration.isTest()).includes(newMixerId)) {
            console.error(`Can not switch to unknown mixer with id ${newMixerId}`)
            return
        }

        this.isChangingMixer = true
        try {
            if(this.currentMixerInstance) {
                const ret = this.currentMixerInstance.disconnect()
                this.communicator.notifyProgramPreviewChanged(null, null)
                this.communicator.notifyChannels(MixerDriver.defaultChannels)
                await Promise.resolve(ret)
            }

            console.log(`Using mixer configuration "${newMixerId}"`)

            let MixerClass
            // @TODO: make it better extensible
            if(newMixerId === AtemConnector.ID) {
                MixerClass = AtemConnector
                this.getCurrentMixerSettings = this.configuration.getAtemConfiguration.bind(this.configuration)
            } else if(newMixerId === VmixConnector.ID) {
                MixerClass = VmixConnector
                this.getCurrentMixerSettings = this.configuration.getVmixConfiguration.bind(this.configuration)
            } else if(newMixerId === ObsConnector.ID) {
                MixerClass = ObsConnector
                this.getCurrentMixerSettings = this.configuration.getObsConfiguration.bind(this.configuration)
            } else if(newMixerId === WirecastConnector.ID) {
                MixerClass = WirecastConnector
                this.getCurrentMixerSettings = this.configuration.getWirecastConfiguration.bind(this.configuration)
            } else if(newMixerId === MockConnector.ID) {
                MixerClass = MockConnector
                this.getCurrentMixerSettings = this.configuration.getMockConfiguration.bind(this.configuration)
            } else if(newMixerId === NullConnector.ID) {
                MixerClass = NullConnector
                this.getCurrentMixerSettings = this.configuration.getNullConfiguration.bind(this.configuration)
            } else if(newMixerId === TestConnector.ID) {
                MixerClass = TestConnector
                this.getCurrentMixerSettings = this.configuration.getTestConfiguration.bind(this.configuration)
            } else {
                console.error(`Someone(TM) forgot to implement the ${newMixerId} mixer in MixerDriver.js.`)
                return
            }
            this.currentMixerId = newMixerId
            this.currentMixerSettings = this.getCurrentMixerSettings ? this.getCurrentMixerSettings() : undefined
            this.currentMixerInstance = new MixerClass(this.currentMixerSettings, this.communicator)
            const ret = this.currentMixerInstance?.connect()
            await Promise.resolve(ret)
        }
        finally {
            this.isChangingMixer = false
        }
    }

    getCurrentPrograms() {
        return this.communicator.getCurrentPrograms()
    }

    getCurrentPreviews() {
        return this.communicator.getCurrentPreviews()
    }
    isConnected() {
        return this.currentMixerInstance !== undefined && this.currentMixerInstance.isConnected()
    }

    static getAllowedMixers = function(isDev: boolean, isTest: boolean) {
        let mixers = [
            MockConnector.ID,
            TestConnector.ID,
            NullConnector.ID,
            // --- order of the first items is important as they act as defaults ---
            AtemConnector.ID,
            ObsConnector.ID,
            VmixConnector.ID,
            WirecastConnector.ID,
        ]

        if (!isDev) {
            mixers = mixers.filter(id => id !== MockConnector.ID)
        }
        if (!isTest) {
            mixers = mixers.filter(id => id !== TestConnector.ID)
        }

        return mixers
    }

    static defaultChannels = Array(8).fill(null).map((_,i) => {
        return new Channel((i+1).toString())
    })
}