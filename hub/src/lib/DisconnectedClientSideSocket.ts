import { EventEmitter } from "events";
import { ClientSideSocket } from "./SocketEvents";

// used for tests only
class DisconnectedClientSideSocket implements ClientSideSocket {
    connected: boolean
    clientEventEmitter: EventEmitter
    serverEventEmitter: EventEmitter

    constructor() {
        this.connected = false
        this.clientEventEmitter = new EventEmitter()
        this.serverEventEmitter = new EventEmitter()
    }

    on(event: string|symbol, listener: (...args: any[]) => void) {
        this.clientEventEmitter.on(event, listener)
        return this
    }
    off(event: string|symbol, listener: (...args: any[]) => void) {
        this.clientEventEmitter.off(event, listener)
        return this
    }
    emit(event: string|symbol, ...args: any[]) {
        this.serverEventEmitter.emit(event, ...args)
        return this
    }
    
    emitServerEvent(event: string|symbol, ...args: any[]) {
        return this.clientEventEmitter.emit(event, ...args)
    }
    
    onServerEvent(event: string|symbol, listener: (...args: any[]) => void) {
        this.serverEventEmitter.on(event, listener)
    }

    cleanUp() {
        this.serverEventEmitter.removeAllListeners()
    }
}
export default DisconnectedClientSideSocket
