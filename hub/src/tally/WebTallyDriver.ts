import { WebTally } from '../domain/Tally'
import { AppConfiguration } from '../lib/AppConfiguration'
import { ServerSideSocket } from '../lib/SocketEvents'
import TallyContainer from './TallyContainer'
import socketIo from 'socket.io'
import CommandCreator from './CommandCreator'
import Log, { Severity } from '../domain/Log'


// - handles connections with Web Tallies
// - emits signals when tallies connect or disconnect
// - sends current state to Web Tallies
class WebTallyDriver {
    container: TallyContainer
    configuration: AppConfiguration
    sockets: Map<string, ServerSideSocket[]> = new Map()

    constructor(configuration: AppConfiguration, container: TallyContainer) {
        this.configuration = configuration
        this.container = container
        this.container.addWebTallyDriver(this)

        // @TODO: check if sockets disconnected
    }

    updateTallyState(tally: WebTally, lastPrograms: string[], lastPreviews: string[]) {
      const name = tally.name
      const command = CommandCreator.getState(tally, lastPrograms, lastPreviews)
      const sockets = this.sockets.get(name) || []
      sockets.forEach(socket => {
        if ((socket as socketIo.Socket).connected) {
          socket.emit('webTally.state', {
            tally: tally.toJson(),
            command: command,
          })
        }
      })
    }

    private updateTallyConnections(tally: WebTally) {
      const connections = (this.sockets.get(tally.name) || []).map((socket: socketIo.Socket) => {
        const address = socket.handshake.address
        return {address: address}
      })
      tally.connectedClients = connections
      this.container.update(tally)
    }

    create(tallyName: string, channelId: string) {
      const tally = this.container.getOrCreate(tallyName, "web") as WebTally
      tally.name = tallyName
      tally.channelId = channelId || undefined
      this.container.update(tally)
    }
    unsubscribe(tallyName: string, socket: ServerSideSocket) {
      const oldSockets = this.sockets.get(tallyName) || []
      const newSockets = oldSockets.filter(knownSocket => knownSocket.id !== socket.id)

      if (oldSockets.length !== newSockets.length) {
        console.debug(`Disconnected ${tallyName} from ${socket.id}`)
        this.sockets.set(tallyName, newSockets)
        const tally = this.container.get(tallyName, "web") as WebTally
        if (tally) {
          this.updateTallyConnections(tally)

          let logLine = `A browser disconnected from ${(socket as socketIo.Socket).handshake.address}. `
          if (tally.connectedClients.length === 0) {
            logLine += "The Tally is disconnected."
          } else if(tally.connectedClients.length === 1) {
            logLine += `There is still one client connected from ${tally.connectedClients[0].address}.`
          } else {
            logLine += `There are still ${tally.connectedClients.length} clients connected from ${tally.connectedClients.map(client => client.address).join(',')}.`
          }
          this.container.addLog(tallyName, 'web', new Log(new Date(), Severity.STATUS, logLine))
        }
      }
    }
    subscribe(tallyName: string, socket: ServerSideSocket) {
      const sockets = this.sockets.get(tallyName) || []
      if (sockets.find(knownSocket => knownSocket.id === socket.id)) {
        console.warn(`socket ${socket.id} is alreday subscribed to ${tallyName}`)
        return
      }
      socket.on('disconnect', () => {
        this.unsubscribe(tallyName, socket)
      })
      const tally = this.container.get(tallyName, "web") as WebTally
      if (tally) {
        console.debug(`Connected ${tallyName} from ${socket.id}`)
        this.sockets.set(tallyName, [ ...sockets, socket ])
        this.updateTallyConnections(tally)
        this.container.addLog(tallyName, 'web', new Log(new Date(), Severity.STATUS,
         `A new browser connected from ${(socket as socketIo.Socket).handshake.address}.`
        ))
      } else {
        console.error(`can not subscribe to unknown web tally "${tallyName}"`)
        socket.emit('webTally.invalid', tallyName)
      }
    }
}

export default WebTallyDriver