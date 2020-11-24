import {EventEmitter} from 'events'
import { ClientSideSocket } from '../../lib/SocketEvents'
import AtemConfiguration from '../../mixer/atem/AtemConfiguration'
import MockConfiguration from '../../mixer/mock/MockConfiguration'
import NullConfiguration from '../../mixer/null/NullConfiguration'
import ObsConfiguration from '../../mixer/obs/ObsConfiguration'
import VmixConfiguration from '../../mixer/vmix/VmixConfiguration'

class ConfigTracker extends EventEmitter{
    // @TODO: this should be more easily extensible
    atemConfiguration?: AtemConfiguration
    // @TODO: not needed when not in dev
    mockConfiguration?: MockConfiguration
    nullConfiguration?: NullConfiguration
    obsConfiguration?: ObsConfiguration
    vmixConfiguration?: VmixConfiguration

    constructor(socket: ClientSideSocket) {
        super()
        
        socket.on('config.state.atem', (atem) => {
            this.atemConfiguration = new AtemConfiguration()
            this.atemConfiguration.fromSave(atem)
            this.emit('atem', this.atemConfiguration)
        })
        socket.emit('events.config.subscribe')
    }
}

export default ConfigTracker
