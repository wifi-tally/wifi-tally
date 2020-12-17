// set NODE_ENV from argument to enable portability to windows
import yargs from 'yargs'

const argv = yargs.argv
if (argv.env !== undefined) {
  // @ts-ignore @TODO: setting the env is not nice, but the easiest way to be cross-platform compatible
  // @see https://github.com/wifi-tally/wifi-tally/issues/18
  process.env.NODE_ENV = argv.env
}

import { TallyDriver } from './lib/TallyDriver'
import { AppConfiguration } from './lib/AppConfiguration'
import { MixerDriver } from './lib/MixerDriver'
import express from 'express'
const app = express()
import { Server } from 'http'
const server = new Server(app)
import socketIo, { Socket } from 'socket.io'
const io = socketIo(server)
import next from 'next'
import Log, { Severity } from './domain/Log'

import { SocketAwareEvent } from './lib/SocketAwareEvent'
import ServerEventEmitter from './lib/ServerEventEmitter'
import Tally from './domain/Tally'
import { ServerSideSocket } from './lib/SocketEvents'
import AppConfigurationPersistence from './lib/AppConfigurationPersistence'
import AtemConfiguration from './mixer/atem/AtemConfiguration'
import VmixConfiguration from './mixer/vmix/VmixConfiguration'
import ObsConfiguration from './mixer/obs/ObsConfiguration'
import MockConfiguration from './mixer/mock/MockConfiguration'

const myEmitter = new ServerEventEmitter()
myEmitter.setMaxListeners(99)
const myConfiguration = new AppConfiguration(myEmitter)
const myConfigurationPersistence = new AppConfigurationPersistence(myConfiguration, myEmitter)

const myMixerDriver = new MixerDriver(myConfiguration, myEmitter)
const myTallyDriver = new TallyDriver(myConfiguration, myEmitter)

const nextApp = next({ dev: myConfiguration.isDev() })
const nextHandler = nextApp.getRequestHandler()

const sendLogToTally = (tally: Tally, log: Log) => {
  io.emit(`tally.logged.${tally.name}`, log)
}
const sendTalliesToBrowser = function() {
  io.emit('tallies', myTallyDriver.toValueObjects())
}
myEmitter.on('tally.connected', sendTalliesToBrowser)
myEmitter.on('tally.changed', sendTalliesToBrowser)
myEmitter.on('tally.logged', ({tally, log}) => sendLogToTally(tally, log))
myEmitter.on('tally.changed', (tally) => {
  io.emit(`tally.changed.${tally.name}`, myTallyDriver.toValueObjects())
})
myEmitter.on('tally.missing', sendTalliesToBrowser)
myEmitter.on('tally.missing', ({tally, diff}) => {
  // @TODO: Logging should be the job of Tally Driver
  const log = tally.addLog(new Date(), null, `Tally got missing. It has not reported for ${diff}ms`)
  sendLogToTally(tally, log)
})
myEmitter.on('tally.timedout', sendTalliesToBrowser)
myEmitter.on('tally.timedout', ({tally, diff}) => {
  const log = tally.addLog(new Date(), null, `Tally got disconnected after not reporting for ${diff}ms`)
  sendLogToTally(tally, log)
})
myEmitter.on('tally.removed', sendTalliesToBrowser)


// send events to tallies
myEmitter.on('program.changed', ({programs, previews}) => {
  myTallyDriver.setState(programs, previews)
})
myEmitter.on('tally.connected', (tally) => myTallyDriver.updateTally(tally.name))
myEmitter.on('tally.changed', (tally) => myTallyDriver.updateTally(tally.name))

// log stuff
myEmitter.on('tally.connected', tally => {
    console.info(`Tally ${tally.name} connected`)
})
myEmitter.on('tally.changed', tally => {
    console.debug(`Tally ${tally.name} changed configuration`)
})
myEmitter.on('tally.missing', ({tally}) => {
    console.warn(`Tally ${tally.name} went missing`)
})
myEmitter.on('tally.timedout', ({tally}) => {
    console.warn(`Tally ${tally.name} timed out`)
})
myEmitter.on('tally.removed', tally => {
    console.debug(`Tally ${tally.name} removed from configuration`)
})
myEmitter.on('tally.logged', ({tally, log}) => {
    let fn = console.info
    if(log.isError()) { 
      fn = console.error 
    } else if(log.isWarning()) {
      fn = console.warn
    }
    fn(`${tally.name}: ${log.message}`)
})
myEmitter.on('program.changed', ({programs, previews}) => {
    console.info("Program/Preview was changed to ", programs, previews)
})

// socket.io server
io.on('connection', (socket: ServerSideSocket) => {
  const mixerEvents = [
    // @TODO: use event objects instead of repeating the same structure again and again
    new SocketAwareEvent(myEmitter, 'mixer.connected', socket, (socket) => {
      socket.emit('mixer.state', {
        isConnected: true
      })
    }),
    new SocketAwareEvent(myEmitter, 'mixer.disconnected', socket, (socket) => {
      socket.emit('mixer.state', {
        isConnected: false
      })
    }),
  ]
  socket.on('events.mixer.subscribe', () => {
    mixerEvents.forEach(pipe => pipe.register())
    socket.emit('mixer.state', {
      isConnected: myMixerDriver.isConnected()
    })
  })
  socket.on('events.mixer.unsubscribe', () => {
    // @TODO: not used yet
    mixerEvents.forEach(pipe => pipe.unregister())
  })

  const programEvents = [
    new SocketAwareEvent(myEmitter, 'program.changed', socket, (socket, {programs, previews}) => {
      socket.emit('program.state', {
        programs: programs,
        previews: previews,
      })
    })
  ]
  socket.on('events.program.subscribe', () => {
    programEvents.forEach(pipe => pipe.register())

    socket.emit('program.state', {
      programs: myMixerDriver.getCurrentPrograms(),
      previews: myMixerDriver.getCurrentPreviews(),
    })
  })
  socket.on('events.program.unsubscribe', () => {
    // @TODO: not used yet
    programEvents.forEach(pipe => pipe.unregister())
  })

  const configEvents = [
    new SocketAwareEvent(myEmitter, 'config.changed.atem', socket, (socket, atemConfiguration) => {
      socket.emit('config.state.atem', atemConfiguration.toJson())
    }),
    new SocketAwareEvent(myEmitter, 'config.changed.mock', socket, (socket, mockConfiguration) => {
      socket.emit('config.state.mock', mockConfiguration.toJson())
    }),
    new SocketAwareEvent(myEmitter, 'config.changed.obs', socket, (socket, obsConfiguration) => {
      socket.emit('config.state.obs', obsConfiguration.toJson())
    }),
    new SocketAwareEvent(myEmitter, 'config.changed.vmix', socket, (socket, vmixConfiguration) => {
      socket.emit('config.state.vmix', vmixConfiguration.toJson())
    }),
    new SocketAwareEvent(myEmitter, 'config.changed.mixer', socket, (socket, mixerName) => {
      socket.emit('config.state.mixer', mixerName)
    }),
  ]
  socket.on('events.config.subscribe', () => {
    configEvents.forEach(pipe => pipe.register())

    socket.emit('config.state.atem', myConfiguration.getAtemConfiguration().toJson())
    socket.emit('config.state.mixer', myConfiguration.getMixerSelection() || "")
    socket.emit('config.state.mock', myConfiguration.getMockConfiguration().toJson())
    socket.emit('config.state.obs', myConfiguration.getObsConfiguration().toJson())
    socket.emit('config.state.vmix', myConfiguration.getVmixConfiguration().toJson())
  })
  socket.on('events.program.unsubscribe', () => {
    // @TODO: not used yet
    configEvents.forEach(pipe => pipe.unregister())
  })

  const tallyEvents = [
    new SocketAwareEvent(myEmitter, 'tally.connected', socket, (socket, tally) => {
      socket.emit('tally.state', {tallies: myTallyDriver.toValueObjects()})
    }),
    new SocketAwareEvent(myEmitter, 'tally.changed', socket, (socket, tally) => {
      socket.emit('tally.state', {tallies: myTallyDriver.toValueObjects()})
    }),
    new SocketAwareEvent(myEmitter, 'tally.missing', socket, (socket, tally) => {
      socket.emit('tally.state', {tallies: myTallyDriver.toValueObjects()})
    }),
    new SocketAwareEvent(myEmitter, 'tally.timedout', socket, (socket, tally) => {
      socket.emit('tally.state', {tallies: myTallyDriver.toValueObjects()})
    }),
    new SocketAwareEvent(myEmitter, 'tally.removed', socket, (socket, tally) => {
      socket.emit('tally.state', {tallies: myTallyDriver.toValueObjects()})
    }),
  ]
  socket.on('events.tally.subscribe', () => {
    tallyEvents.forEach(pipe => pipe.register())

    socket.emit('tally.state', {tallies: myTallyDriver.toValueObjects()})
  })
  socket.on('events.tally.unsubscribe', () => {
    // @TODO: not used yet
    tallyEvents.forEach(pipe => pipe.unregister())
  })
  
  socket.on('tally.patch', (tallyName, channelId) => {
    myTallyDriver.patchTally(tallyName, channelId)
  })
  socket.on('tally.highlight', (tallyName) => {
    myTallyDriver.highlight(tallyName)
  })
  socket.on('tally.remove', tallyName => {
    myTallyDriver.removeTally(tallyName)
  })

  const channelEvents = [
    new SocketAwareEvent(myEmitter, 'config.changed.channels', socket, (socket, channels) => {
      socket.emit('channel.state', {channels: channels.map(channel => channel.toJson())})
    }),
  ]
  socket.on('events.channel.subscribe', () => {
    channelEvents.forEach(pipe => pipe.register())

    socket.emit('channel.state', {channels: myConfiguration.getChannelsAsJson()})
  })
  socket.on('events.channel.unsubscribe', () => {
    // @TODO: not used yet
    channelEvents.forEach(pipe => pipe.unregister())
  })


  socket.on('config.change.atem', (newAtemConfiguration, newMixerName) => {
    const atem = new AtemConfiguration()
    atem.fromJson(newAtemConfiguration)
    myConfiguration.setAtemConfiguration(atem)

    if (newMixerName) {
      myConfiguration.setMixerSelection(newMixerName)
    }
  })
  socket.on('config.change.mock', (newMockConfiguration, newMixerName) => {
    const mock = new MockConfiguration()
    mock.fromJson(newMockConfiguration)
    myConfiguration.setMockConfiguration(mock)

    if (newMixerName) {
      myConfiguration.setMixerSelection(newMixerName)
    }
  })
  socket.on('config.change.null', newMixerName => {
    if (newMixerName) {
      myConfiguration.setMixerSelection(newMixerName)
    }
  })
  socket.on('config.change.obs', (newObsConfiguration, newMixerName) => {
    const obs = new ObsConfiguration()
    obs.fromJson(newObsConfiguration)
    myConfiguration.setObsConfiguration(obs)

    if (newMixerName) {
      myConfiguration.setMixerSelection(newMixerName)
    }
  })
  socket.on('config.change.vmix', (newVmixConfiguration, newMixerName) => {
    const vmix = new VmixConfiguration()
    vmix.fromJson(newVmixConfiguration)
    myConfiguration.setVmixConfiguration(vmix)

    if (newMixerName) {
      myConfiguration.setMixerSelection(newMixerName)
    }
  })
})

nextApp.prepare().then(() => {
  app.get('/tallies', (req, res) => {
    res.json({
      tallies: myTallyDriver.toValueObjects(),
    })
  })
  app.get('/tally', (req, res) => {
    const tallyName = req.query.tallyName?.toString()
    if (!tallyName) {
      res.status(404)
    } else {
      const tally = myTallyDriver.getTally(tallyName)
      if (!tally) {
        res.status(404)
      } else {
        res.json({
          tally: tally.toJson(),
          logs: tally.getLogs().map(log => log.toValueObject()),
        })
      }
    }
  })
  app.get('/atem', (req, res) => {
    // @TODO: "any" is not nice here, but this should be removed soon anyways
    const data: any = myConfiguration.mixerConfigToObject()
    data.allowedMixers = MixerDriver.getAllowedMixers(myConfiguration.isDev())
    res.json(data)
  })

  app.use('/lato', express.static(__dirname + '/node_modules/lato-font/css/'));
  app.use('/fonts', express.static(__dirname + '/node_modules/lato-font/fonts/'));

  app.get('*', (req, res) => {
    return nextHandler(req, res)
  })

  server.listen(myConfiguration.getHttpPort(), () => {
    console.log(`Web Server available on http://localhost:${myConfiguration.getHttpPort()}`)
  })
})
