import Log from './Log'

export enum ConnectionState {
    DISCONNECTED = 0,
    CONNECTED = 1,
    MISSING = 2,
}

export type TallySaveObject = {
    name: string
    channelId?: string
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
    toValueObject(): any {
        return {
            name: this.name,
            channelId: this.channelId,
            address: this.address,
            port: this.port,
            state: this.state,
        }
    }
    isIn(channelNames: string[] = []) : boolean {
        if (channelNames === null) return false
        if (this.channelId === undefined) return false

        return channelNames.indexOf(this.channelId) !== -1
    }

    toSave(): TallySaveObject {
        return {
            name: this.name,
            channelId: this.channelId,
        }
    }

    static fromSave(valueObject: TallySaveObject) {
        return new Tally(valueObject.name, valueObject.channelId)
    }

    static fromValueObject(valueObject: any) {
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
