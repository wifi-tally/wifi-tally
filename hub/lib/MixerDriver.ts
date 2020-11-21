import AtemConnector from '../mixer/atem/AtemConnector'
import VmixConnector from '../mixer/vmix/VmixConnector'
import MockConnector from '../mixer/mock/MockConnector'
import NullConnector from '../mixer/null/NullConnector'
import ObsConnector from '../mixer/obs/ObsConnector'
import { MixerCommunicator } from './MixerCommunicator'
import Channel from '../domain/Channel'
import type { Configuration } from './Configuration'
import ServerEventEmitter from './ServerEventEmitter'
import { Connector } from '../mixer/interfaces'

// Takes care of connecting to one of the supported mixers
export class MixerDriver {
    currentMixerId?: string
    currentMixerInstance?: Connector
    currentMixerSettings: unknown[]
    getCurrentMixerSettings?: Function
    configuration: Configuration
    communicator: MixerCommunicator
    emitter: ServerEventEmitter
    isChangingMixer: boolean
    
    constructor(configuration: Configuration, emitter: ServerEventEmitter) {
        this.currentMixerSettings = []
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
            } else if (this.getCurrentMixerSettings) {
                const mixerSettings = this.getCurrentMixerSettings()
                if (this.currentMixerSettings.length !== mixerSettings.length) {
                    // a new setting was added (not sure why this would happen, but definitely a reason to restart)
                    console.debug("mixer connection is restarted, because number of settings were changed")
                    needsRefresh = true
                } else {
                    const anyChanges = this.currentMixerSettings.some((value, idx) => {
                        return value !== mixerSettings[idx]
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
            if(newMixerId === AtemConnector.ID) {
                this.getCurrentMixerSettings = () => [this.configuration.getAtemIp(), this.configuration.getAtemPort()]
                MixerClass = AtemConnector
            } else if(newMixerId === VmixConnector.ID) {
                this.getCurrentMixerSettings = () => [this.configuration.getVmixIp(), this.configuration.getVmixPort()]
                MixerClass = VmixConnector
            } else if(newMixerId === ObsConnector.ID) {
                this.getCurrentMixerSettings = () => [this.configuration.getObsIp(), this.configuration.getObsPort()]
                MixerClass = ObsConnector
            } else if(newMixerId === MockConnector.ID) {
                this.getCurrentMixerSettings = () => [this.configuration.getMockTickTime(), this.configuration.getMockChannelCount(), this.configuration.getMockChannelNames()]
                MixerClass = MockConnector
            } else if(newMixerId === NullConnector.ID) {
                this.getCurrentMixerSettings = () => []
                MixerClass = NullConnector
            } else {
                console.error(`Someone(TM) forgot to implement the ${newMixerId} mixer in MixerDriver.js.`)
                return
            }
            this.currentMixerId = newMixerId
            this.currentMixerSettings = this.getCurrentMixerSettings()
            this.currentMixerInstance = new MixerClass(...this.currentMixerSettings, this.communicator)
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


    static getAllowedMixers = function(isDev: boolean) {
        const mixers = [
            NullConnector.ID,
            AtemConnector.ID,
            ObsConnector.ID,
            VmixConnector.ID,
        ]
    
        if (isDev) {
            mixers.unshift(MockConnector.ID)
        }
    
        return mixers
    }

    static getDefaultMixerId = function(isDev: boolean) {
        return this.getAllowedMixers(isDev)[0];
    }

    static isValidMixerId = function(name: string, isDev: boolean) {
        return this.getAllowedMixers(isDev).includes(name)
    }

    static defaultChannels = Array(8).fill(null).map((_,i) => {
        return new Channel((i+1).toString())
    })
}