import { AtemConfigurationSaveType } from "../mixer/atem/AtemConfiguration";
import { MockConfigurationSaveType } from "../mixer/mock/MockConfiguration";
import { ObsConfigurationSaveType } from "../mixer/obs/ObsConfiguration";
import { VmixConfigurationSaveType } from "../mixer/vmix/VmixConfiguration";
import { ChannelList } from "./MixerCommunicator";
import { TallyObjectType, TallyType, WebTallyObjectType } from "../domain/Tally";
import { ChannelSaveObject } from "../domain/Channel";
import { LogObjectType } from "../domain/Log";
import { TestConfigurationSaveType } from "../mixer/test/TestConfiguration";
import { StateCommand } from "../tally/CommandCreator";
import { TallyConfigurationObjectType } from "../tally/TallyConfiguration";
import { TallyDeviceObjectType } from "../flasher/TallyDevice";
import TallySettingsIni from "../flasher/TallySettingsIni";
import { TallyProgramProgressType, TallySettingsIniProgressType } from "../flasher/NodeMcuConnector";

// events the server sends to the client
export interface ServerSentEvents {
    'tally.state': (data: {tallies: TallyObjectType[]}) => void
    'tally.log': (data: {tallyId: string, log: LogObjectType}) => void
    'tally.log.state': (data: {tallyId: string, logs: LogObjectType[]}[]) => void
    'webTally.state': (data: {tally: WebTallyObjectType, command: StateCommand}) => void
    'webTally.invalid': (tallyName: string) => void

    'mixer.state': (data: {isConnected: boolean}) => void
    'program.state': (data: {programs: ChannelList, previews: ChannelList}) => void
    'channel.state': (data: {channels: ChannelSaveObject[]}) => void

    'config.state.atem': (atemConfiguration: AtemConfigurationSaveType) => void
    'config.state.mock': (mockConfiguration: MockConfigurationSaveType) => void
    'config.state.obs': (obsConfiguration: ObsConfigurationSaveType) => void
    'config.state.vmix': (vmixConfiguration: VmixConfigurationSaveType) => void
    'config.state.tallyconfig': (defaultTallyConfiguration: TallyConfigurationObjectType) => void
    'config.state.mixer': (data: {mixerName: string, allowedMixers: string[]}) => void

    'flasher.device': (tallyDevice: TallyDeviceObjectType) => void
    'flasher.settingsIni.progress': (state: TallySettingsIniProgressType) => void
    'flasher.program.progress': (state: TallyProgramProgressType) => void
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
    'events.webTally.subscribe': (tallyName: string) =>  void
    'events.webTally.unsubscribe': (tallyName: string) =>  void

    'tally.patch': (tallyName: string, tallyType: TallyType, channelId: string|null) => void
    'tally.highlight': (tallyName: string, tallyType: TallyType) => void
    'tally.remove': (tallyName: string, tallyType: TallyType) => void
    'tally.create': (tallyName: string, channelId?: string) => void
    'tally.settings': (tallyName: string, tallyType: TallyType, settings: TallyConfigurationObjectType) => void

    'config.change.atem': (atemConfiguration: AtemConfigurationSaveType, newMixer?: "atem") => void
    'config.change.mock': (mockConfiguration: MockConfigurationSaveType, newMixer?: "mock") => void
    'config.change.null': (newMixer?: "null") => void
    'config.change.test': (testConfiguration: TestConfigurationSaveType, newMixer?: "test") => void
    'config.change.obs': (obsConfiguration: ObsConfigurationSaveType, newMixer?: "obs") => void
    'config.change.vmix': (vmixConfiguration: VmixConfigurationSaveType, newMixer?: "vmix") => void
    'config.change.tallyconfig': (configuration: TallyConfigurationObjectType) => void

    'flasher.device.get': () => void
    'flasher.settingsIni': (path: string, settingsIniString: string) => void
    'flasher.program': (path: string) => void
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