import { AtemConfigurationSaveType } from "../mixer/atem/AtemConfiguration";
import { MockConfigurationSaveType } from "../mixer/mock/MockConfiguration";
import { ObsConfigurationSaveType } from "../mixer/obs/ObsConfiguration";
import { VmixConfigurationSaveType } from "../mixer/vmix/VmixConfiguration";
import { ChannelList } from "./MixerCommunicator";
import { TallyObjectType } from "../domain/Tally";
import { ChannelSaveObject } from "../domain/Channel";
import { LogObjectType } from "../domain/Log";

// events the server sends to the client
export interface ServerSentEvents {
    'tally.state': (data: {tallies: TallyObjectType[]}) => void
    'tally.log': (data: {tallyName: string, log: LogObjectType}) => void
    'tally.log.state': (data: {tallyName: string, logs: LogObjectType[]}[]) => void

    'mixer.state': (data: {isConnected: boolean}) => void
    'program.state': (data: {programs: ChannelList, previews: ChannelList}) => void
    'channel.state': (data: {channels: ChannelSaveObject[]}) => void

    'config.state.atem': (atemConfiguration: AtemConfigurationSaveType) => void
    'config.state.mock': (mockConfiguration: MockConfigurationSaveType) => void
    'config.state.obs': (obsConfiguration: ObsConfigurationSaveType) => void
    'config.state.vmix': (vmixConfiguration: VmixConfigurationSaveType) => void
    'config.state.mixer': (data: {mixerName: string, allowedMixers: string[]}) => void
}

// events the client sends to the server
export interface ClientSentEvents {
    'events.mixer.subscribe': () => void
    'events.mixer.unsubscribe': () => void
    'events.program.subscribe': () => void
    'events.program.unsubscribe': () => void
    'events.config.subscribe': () => void
    'events.config.unsubscribe': () => void
    'events.tally.subscribe': () => void
    'events.tally.unsubscribe': () => void
    'events.channel.subscribe': () => void
    'events.channel.unsubscribe': () => void
    'events.tallyLog.subscribe': () => void
    'events.tallyLog.unsubscribe': () => void

    'tally.patch': (tallyName: string, channelId: string) => void
    'tally.highlight': (tallyName: string) => void
    'tally.remove': (tallyName: string) => void

    'config.change.atem': (atemConfiguration: AtemConfigurationSaveType, newMixer?: "atem") => void
    'config.change.mock': (mockConfiguration: MockConfigurationSaveType, newMixer?: "mock") => void
    'config.change.null': (newMixer?: "null") => void
    'config.change.test': (newMixer?: "test") => void
    'config.change.obs': (obsConfiguration: ObsConfigurationSaveType, newMixer?: "obs") => void
    'config.change.vmix': (vmixConfiguration: VmixConfigurationSaveType, newMixer?: "vmix") => void
}

export interface ServerSideSocket {
    id: string
    
    emit<EventName extends keyof ServerSentEvents>(
        event: EventName,
        ...args: Parameters<ServerSentEvents[EventName]>
    ): boolean

    on<EventName extends keyof ClientSentEvents>(
        event: EventName,
        listener: ClientSentEvents[EventName]
    ): this
    on(event: "disconnect", listener: () => void) // @TODO: shouldn't this be defined in the parent?

    off<EventName extends keyof ClientSentEvents>(
        event: EventName,
        listener: ClientSentEvents[EventName]
    ): this
}

export interface ClientSideSocket {
    connected: boolean

    emit<EventName extends keyof ClientSentEvents>(
        event: EventName,
        ...args: Parameters<ClientSentEvents[EventName]>
    ): any

    on<EventName extends keyof ServerSentEvents>(
        event: EventName,
        listener: ServerSentEvents[EventName]
    ): any
    on(event: "disconnect", listener: () => void) : any // @TODO: shouldn't this be defined in the parent?
    on(event: "connect", listener: () => void) : any // @TODO: shouldn't this be defined in the parent?
    on(event: "connect_error", listener: () => void) : any // @TODO: shouldn't this be defined in the parent?
    on(event: "connect_timeout", listener: () => void) : any // @TODO: shouldn't this be defined in the parent?
    on(event: "disconnected", listener: () => void) : any // @TODO: shouldn't this be defined in the parent?
    on(event: "reconnect", listener: () => void) : any // @TODO: shouldn't this be defined in the parent?
    on(event: "reconnecting", listener: () => void) : any // @TODO: shouldn't this be defined in the parent?
    on(event: "reconnect_error", listener: () => void) : any // @TODO: shouldn't this be defined in the parent?
    on(event: "reconnect_failed", listener: () => void) : any // @TODO: shouldn't this be defined in the parent?

    off<EventName extends keyof ServerSentEvents>(
        event: EventName,
        listener: ServerSentEvents[EventName]
    ): any
}