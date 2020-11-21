import { EventEmitter } from "events";
import Log from "../domain/Log";
import Tally from "../domain/Tally";
import { ChannelList } from "./MixerCommunicator";

/* events that are send around on the server */

export interface EventHandlersDataMap {
    'config.changed': () => void
    'mixer.connected': () => void
    'mixer.disconnected': () => void
    'program.changed': (data: {programs: ChannelList, previews: ChannelList}) => void
    'tally.changed': (t: Tally) => void
    'tally.connected': (t: Tally) => void
    'tally.logged': (data: {tally: Tally, log: Log}) => void
    'tally.missing': (data: {tally: Tally, diff: number}) => void
    'tally.removed': (t: Tally) => void
    'tally.reported': (t: Tally) => void
    'tally.timedout': (data: {tally: Tally, diff: number}) => void
}

export type ServerEventName = keyof EventHandlersDataMap

interface ServerEventEmitter extends EventEmitter {
    emit<EventName extends keyof EventHandlersDataMap>(
        eventName: EventName,
        ...args: Parameters<EventHandlersDataMap[EventName]>
    ): boolean

    on<EventName extends keyof EventHandlersDataMap>(
        eventName: EventName,
        listener: EventHandlersDataMap[EventName]
    ): this
}

class ServerEventEmitter extends EventEmitter {}

export default ServerEventEmitter
