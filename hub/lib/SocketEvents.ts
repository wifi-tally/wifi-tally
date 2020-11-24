import { AtemConfigurationSaveType } from "../mixer/atem/AtemConfiguration";
import { ChannelList } from "./MixerCommunicator";

// events the server sends to the client
export interface ServerSentEvents {
    'tallies': (tallies: object[]) => void //@TODO: event should be better typed
    'mixer.state': (data: {isConnected: boolean}) => void
    'program.state': (data: {programs: ChannelList, previews: ChannelList}) => void

    'config.state.atem': (atemConfiguration: AtemConfigurationSaveType) => void
}

// events the client sends to the server
export interface ClientSentEvents {
    'events.mixer.subscribe': () => void
    'events.mixer.unsubscribe': () => void
    'events.program.subscribe': () => void
    'events.program.unsubscribe': () => void
    'events.config.subscribe': () => void
    'events.config.unsubscribe': () => void

    'tally.patch': (tallyName: string, channelId: string) => void
    'tally.highlight': (tallyName: string) => void
    'tally.remove': (tallyName: string) => void

    // @TODO: this one is insane. Change it!
    'config.changeRequest': (selectedMixer: string, atemIp: string, atemPort: number, vmixIp: string, vmixPort: number, obsIp: string, obsPort: number, mockTickTime: number, mockChannelCount: number, mockChannelNames: string) => void
    'config.change.atem': (atemConfiguration: AtemConfigurationSaveType) => void
}

export interface ServerSideSocket extends SocketIO.Socket {
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

export interface ClientSideSocket extends SocketIOClient.Socket {
    emit<EventName extends keyof ClientSentEvents>(
        event: EventName,
        ...args: Parameters<ClientSentEvents[EventName]>
    ): this

    on<EventName extends keyof ServerSentEvents>(
        event: EventName,
        listener: ServerSentEvents[EventName]
    ): this
    on(event: "disconnect", listener: () => void) : this // @TODO: shouldn't this be defined in the parent?
    on(event: "connect", listener: () => void) : this // @TODO: shouldn't this be defined in the parent?
    on(event: "connect_error", listener: () => void) : this // @TODO: shouldn't this be defined in the parent?
    on(event: "connect_timeout", listener: () => void) : this // @TODO: shouldn't this be defined in the parent?
    on(event: "disconnected", listener: () => void) : this // @TODO: shouldn't this be defined in the parent?
    on(event: "reconnect", listener: () => void) : this // @TODO: shouldn't this be defined in the parent?
    on(event: "reconnecting", listener: () => void) : this // @TODO: shouldn't this be defined in the parent?
    on(event: "reconnect_error", listener: () => void) : this // @TODO: shouldn't this be defined in the parent?
    on(event: "reconnect_failed", listener: () => void) : this // @TODO: shouldn't this be defined in the parent?

    off<EventName extends keyof ServerSentEvents>(
        event: EventName,
        listener: ServerSentEvents[EventName]
    ): this
}