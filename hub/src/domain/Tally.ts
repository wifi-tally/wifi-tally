import Log from './Log'

export enum ConnectionState {
    DISCONNECTED = 0,
    CONNECTED = 1,
    MISSING = 2,
}

type ClientAddress = {
    address: string
    port: number
}

export type TallySaveObjectType = {
    name: string
    type?: TallyType
    channelId?: string
}

export interface TallyObjectType {
    name: string
    type: TallyType
    channelId?: string
}

export interface UdpTallyObjectType extends TallyObjectType {
    address?: string
    port?: number
    state: ConnectionState
}

export interface WebTallyObjectType extends TallyObjectType {
    connectedClients: ClientAddress[]
}

export type TallyType = "udp" | "web"

export abstract class Tally {
    name: string
    channelId?: string
    highlight: boolean
    logs: Log[]
    readonly type: TallyType

    constructor(name: string, channelId?: string) {
        this.name = name
        this.channelId = channelId
        this.highlight = false
        this.logs = []
    }
    isPatched() : boolean {
        return this.channelId !== undefined
    }
    abstract isConnected() : boolean
    abstract isDisconnected() : boolean
    abstract isActive() : boolean
    abstract isMissing() : boolean
    setHighlight(highlight: boolean) : void {
        this.highlight = highlight
    }
    isHighlighted() : boolean {
        return this.highlight
    }

    isWebTally() : this is WebTally {
        return this.type === "web"
    }

    isUdpTally() : this is UdpTally {
        return this.type === "udp"
    }

    addLog(log: Log) {
        this.logs.push(log)
        return log
    }
    getLogs() {
        return this.logs
    }

    getId() {
        return `${this.type}-${this.name}`
    }

    isIn(channelNames: string[] = []) : boolean {
        if (channelNames === null) return false
        if (this.channelId === undefined) return false

        return channelNames.indexOf(this.channelId) !== -1
    }

    toJsonForSave(): TallySaveObjectType {
        return {
            name: this.name,
            type: this.type,
            channelId: this.channelId,
        }
    }

    static fromJsonForSave(valueObject: TallySaveObjectType) : UdpTally | WebTally {
        if (valueObject.type === "web") {
            return new WebTally(valueObject.name, valueObject.channelId)
        } else {
            // UdpTally was the previous default. So if no type is set we also expect an Udp Tally
            return new UdpTally(valueObject.name, valueObject.channelId)
        }
    }

    toJson(): TallyObjectType {
        return {
            name: this.name,
            type: this.type,
            channelId: this.channelId,
        }
    }
    static fromJson(valueObject: TallyObjectType) {
        if (valueObject.type === "web") {
            return WebTally.fromJson(valueObject as WebTallyObjectType)
        } else {
            return UdpTally.fromJson(valueObject as UdpTallyObjectType)
        }
    }
}

export class UdpTally extends Tally {
    address?: string
    port?: number
    state: ConnectionState
    readonly type = "udp"

    constructor(name: string, channelId?: string, address?: string, port?: number, state: ConnectionState = ConnectionState.DISCONNECTED) {
        super(name, channelId)
        this.address = address
        this.port = port
        this.state = state
    }

    isConnected() : boolean {
        return this.address !== undefined && this.port !== undefined && this.state === ConnectionState.CONNECTED
    }
    isDisconnected(): boolean {
        return !this.isActive()
    }
    isActive() : boolean {
        return this.address !== undefined && this.port !== undefined && this.state !== ConnectionState.DISCONNECTED
    }
    isMissing() : boolean {
        return this.address !== undefined && this.port !== undefined && this.state === ConnectionState.MISSING
    }

    toJson(): UdpTallyObjectType {
        return {
            ...super.toJson(),
            address: this.address,
            port: this.port,
            state: this.state,
        }
    }
    static fromJson(valueObject: UdpTallyObjectType) {
        const tally = new UdpTally(
            valueObject.name,
            valueObject.channelId,
            valueObject.address,
            valueObject.port,
            valueObject.state
        )
        return tally
    }

}

export class WebTally extends Tally {
    readonly type = "web"
    connectedClients: ClientAddress[]

    constructor(name: string, channelId?: string, connectedClients?: ClientAddress[]) {
        super(name, channelId)

        this.connectedClients = connectedClients || []
    }

    isConnected() : boolean {
        return this.connectedClients.length > 0
    }
    isDisconnected(): boolean {
        return !this.isConnected()
    }
    isActive(): boolean {
        return this.isConnected()
    }
    isMissing(): boolean {
        return false
    }

    toJson(): WebTallyObjectType {
        return {
            ...super.toJson(),
            connectedClients: this.connectedClients
        }
    }

    static fromJson(valueObject: WebTallyObjectType) {
        const tally = new WebTally(
            valueObject.name,
            valueObject.channelId,
            valueObject.connectedClients
        )
        return tally
    }
}

export default Tally
