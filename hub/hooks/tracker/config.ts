import {EventEmitter} from 'events'
import { ClientSideSocket } from '../../lib/SocketEvents'
import AtemConfiguration from '../../mixer/atem/AtemConfiguration'
import MockConfiguration from '../../mixer/mock/MockConfiguration'
import NullConfiguration from '../../mixer/null/NullConfiguration'
import ObsConfiguration from '../../mixer/obs/ObsConfiguration'
import VmixConfiguration from '../../mixer/vmix/VmixConfiguration'

class ConfigTracker extends EventEmitter{
    mixerName?: string
    // @TODO: this should be more easily extensible
    atemConfiguration?: AtemConfiguration
    // @TODO: not needed when not in dev
    mockConfiguration?: MockConfiguration
    obsConfiguration?: ObsConfiguration
    vmixConfiguration?: VmixConfiguration

    constructor(socket: ClientSideSocket) {
        super()
        
        socket.on('config.state.mixer', (mixer) => {
            this.mixerName = mixer
            this.emit('mixer', this.mixerName)
        })
        socket.on('config.state.atem', (atem) => {
            this.atemConfiguration = new AtemConfiguration()
            this.atemConfiguration.fromSave(atem)
            this.emit('atem', this.atemConfiguration)
        })
        socket.on('config.state.mock', (mock) => {
            this.mockConfiguration = new MockConfiguration()
            this.mockConfiguration.fromSave(mock)
            this.emit('mock', this.mockConfiguration)
        })
        socket.on('config.state.obs', (obs) => {
            this.obsConfiguration = new ObsConfiguration()
            this.obsConfiguration.fromSave(obs)
            this.emit('obs', this.obsConfiguration)
        })
        socket.on('config.state.vmix', (vmix) => {
            console.log(vmix)
            this.vmixConfiguration = new VmixConfiguration()
            this.vmixConfiguration.fromSave(vmix)
            this.emit('vmix', this.vmixConfiguration)
        })
        socket.emit('events.config.subscribe')
    }
}

export default ConfigTracker
