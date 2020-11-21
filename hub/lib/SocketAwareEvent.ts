import { EventEmitter } from 'events'
import { Socket } from 'socket.io'

/* Takes care that an event on the server is passed through
 * a socket to the browser.
 * 
 * The heavy lifting it does is making sure events are registered
 * and unregistered accordingly. This should prevent dangling event
 * listeners as much as possible.
 */
export class SocketAwareEvent {
    eventEmitter: EventEmitter
    socket: Socket
    eventName: string
    eventListener: (...args: any[]) => void
    isRegistered: boolean
    
    constructor(eventEmitter: EventEmitter, eventName, socket, fnc) {
        this.eventEmitter = eventEmitter
        this.socket = socket
        this.eventName = eventName

        this.eventListener = (...args) => {
            fnc(socket, ...args)
        }
        this.isRegistered = false

    }

    register() {
        if (!this.isRegistered) {
            console.debug(`Connecting event ${this.eventName} to socket ${this.socket.id}`)
            this.eventEmitter.on(this.eventName, this.eventListener)
            this.socket.on("disconnect", () => this.unregister())
            this.isRegistered = true
        }
        
    }

    unregister() {
        if (this.isRegistered) {
            console.debug(`Detatching event ${this.eventName} from socket ${this.socket.id}`)
        }
        this.eventEmitter.off(this.eventName, this.eventListener)
        this.isRegistered = false
    }
}
