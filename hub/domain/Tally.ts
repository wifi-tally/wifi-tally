import Log from './Log'

export enum ConnectionState {
    DISCONNECTED = 0,
    CONNECTED = 1,
    MISSING = 2,
}

export type TallySaveObjectType = {
    name: string
    channelId?: string
}

export type TallyObjectType = {
    name: string
    channelId?: string
    address?: string
    port?: number,
    state: ConnectionState
}

export class Tally {
    name: string
    channelId?: string
    address?: string
    port?: number
    state: ConnectionState
    highlight: boolean
    logs: Log[]

    constructor(name: string, channelId?: string, address?: string, port?: number, state: ConnectionState = ConnectionState.DISCONNECTED) {
        this.name = name
        this.channelId = channelId
        this.address = address
        this.port = port
        this.state = state
        this.highlight = false
        this.logs = []
    }
    isPatched() : boolean {
        return this.channelId !== null
    }
    isConnected() : boolean {
        return this.address !== null && this.port !== null && this.state === ConnectionState.CONNECTED
    }
    isDisconnected() : boolean {
        return !this.isActive()
    }
    isActive() : boolean {
        return this.address !== null && this.port !== null && this.state !== ConnectionState.DISCONNECTED
    }
    isMissing() : boolean {
        return this.address !== null && this.port !== null && this.state === ConnectionState.MISSING
    }
    setHighlight(highlight: boolean) : void {
        this.highlight = highlight
    }
    isHighlighted() : boolean {
        return this.highlight
    }
    addLog(dateTime: Date | string | null, severity: string | null, message: string) {
        const log = new Log(dateTime, severity, message)
        this.logs.push(log)
        return log
    }
    getLogs() {
        return this.logs
    }
    isIn(channelNames: string[] = []) : boolean {
        if (channelNames === null) return false
        if (this.channelId === undefined) return false

        return channelNames.indexOf(this.channelId) !== -1
    }

    toJsonForSave(): TallySaveObjectType {
        return {
            name: this.name,
            channelId: this.channelId,
        }
    }

    static fromJsonForSave(valueObject: TallySaveObjectType) {
        return new Tally(valueObject.name, valueObject.channelId)
    }

    toJson(): TallyObjectType {
        return {
            name: this.name,
            channelId: this.channelId,
            address: this.address,
            port: this.port,
            state: this.state,
        }
    }
    static fromJson(valueObject: TallyObjectType) {
        const tally = new Tally(
            valueObject.name,
            valueObject.channelId,
            valueObject.address,
            valueObject.port,
            valueObject.state
        )
        return tally
    }
}

export default Tally
