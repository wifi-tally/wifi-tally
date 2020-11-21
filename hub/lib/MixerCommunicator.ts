/* helper so that video mixer connectors do not need to implement events */

import Channel from "../domain/Channel"
import { Configuration } from "./Configuration"
import {EventEmitter} from "events"

const haveValuesChanged = (lastArray: any, newArray: any) => {
    if(Array.isArray(lastArray) && Array.isArray(newArray)) {
        return lastArray.length !== newArray.length || lastArray.some((value, index) => value !== newArray[index])
    } else {
        return lastArray !== newArray
    }
}

export class MixerCommunicator {
    configuration: Configuration
    emitter: EventEmitter
    currentPrograms: string[] | null
    currentPreviews: string[] | null
    isConnected: boolean | null
    
    constructor(configuration: Configuration, emitter: EventEmitter) {
        this.configuration = configuration
        this.emitter = emitter

        this.currentPrograms = null
        this.currentPreviews = null
        this.isConnected = null
    }

    private changeProgramsIfNecessary(programs: string[] | null) {
        programs = programs ? programs.map(v => v.toString()) : null
        if (haveValuesChanged(programs, this.currentPrograms)) {
            this.currentPrograms = programs
            return true
        } else {
            return false
        }
    }

    private changePreviewsIfNecessary(previews: string[] | null) {
        previews = previews ? previews.map(v => v.toString()) : null
        if (haveValuesChanged(previews, this.currentPreviews)) {
            this.currentPreviews = previews
            return true
        } else {
            return false
        }
    }

    notifyProgramPreviewChanged(programs: string[] | null, previews: string[] | null) {
        const programChanged = this.changeProgramsIfNecessary(programs)
        const previewChanged = this.changePreviewsIfNecessary(previews)
        if (previewChanged || programChanged) {
            this.emitter.emit('program.changed', { programs: this.currentPrograms, previews: this.currentPreviews })
        }
    }

    notifyProgramChanged(programs: string[] | null) {
        const programChanged = this.changeProgramsIfNecessary(programs)
        if (programChanged) {
            this.emitter.emit('program.changed', { programs: this.currentPrograms, previews: this.currentPreviews })
        }
    }

    notifyPreviewChanged(previews: string[] | null) {
        const previewChanged = this.changePreviewsIfNecessary(previews)
        if (previewChanged) {
            this.emitter.emit('program.changed', { programs: this.currentPrograms, previews: this.currentPreviews })
        }
    }

    notifyChannelNames(count?: number, names?: object) {
        if (count === null) {
            this.notifyChannels(null)
        } else {
            // empty array with `count` elements.
            // `fill` is necessary, because Array() does not fill the array with anything - not even `undefined` ¯\_(ツ)_/¯
            const range = Array(count).fill(null)
            
            const channels = range.map((_,i) => {
                const name = names && names[i+1]
                return new Channel((i+1).toString(), name)
            })

            this.notifyChannels(channels)
        }
    }

    notifyChannels(channels : Channel[] | null) {
        channels = channels || []
        if (JSON.stringify(channels.map(c => c.toValueObject())) !== JSON.stringify(this.configuration.getChannels().map(c => c.toValueObject()))) {
            this.configuration.setChannels(channels)
            this.configuration.save()

            this.emitter.emit("config.changed")
        }
    }

    notifyMixerIsConnected() {
        if (this.isConnected !== true) {
            this.isConnected = true
            this.emitter.emit('mixer.connected')
        }
    }

    notifyMixerIsDisconnected() {
        if (this.isConnected !== false) {
            this.isConnected = false
            this.emitter.emit('mixer.disconnected')
        }
    }

    getCurrentPrograms() {
        return this.currentPrograms
    }

    getCurrentPreviews() {
        return this.currentPreviews
    }
}
