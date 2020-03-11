const TallyDriver = require('./lib/TallyDriver')
const Configuration = require('./lib/Configuration')
const MixerDriver = require('./lib/MixerDriver')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')

const EventEmitter = require('events')

// - program.changed
// - tally.connected
// - tally.changed
// - tally.reported
// - tally.missing
// - tally.timedout
// - tally.removed
// - atem.connected
// - atem.disconnected
// - config.changed.mixer
// - config.changed.atem
// - config.changed.mock
const myEmitter = new EventEmitter()
const myConfiguration = new Configuration("config.json", myEmitter)
const myMixerDriver = new MixerDriver(myConfiguration, myEmitter)
const myTallyDriver = new TallyDriver(myConfiguration.getTallies(), myEmitter)

const nextApp = next({ dev: myConfiguration.isDev() })
const nextHandler = nextApp.getRequestHandler()

// keep configruation up to date
const updateTallies = function() {
  myConfiguration.updateTallies(myTallyDriver)
}
myEmitter.on('tally.connected', updateTallies)
myEmitter.on('tally.changed', updateTallies)
myEmitter.on('tally.removed', updateTallies)

// send events to browsers
myEmitter.on('program.changed', (programs, previews) => {
  io.emit('program.changed', {programs, previews})
})

const sendTalliesToBrowser = function() {
  io.emit('tallies', myTallyDriver.toValueObjects())
}
myEmitter.on('tally.connected', sendTalliesToBrowser)
myEmitter.on('tally.changed', sendTalliesToBrowser)
myEmitter.on('tally.missing', sendTalliesToBrowser)
myEmitter.on('tally.timedout', sendTalliesToBrowser)
myEmitter.on('tally.removed', sendTalliesToBrowser)

const sendConfigurationToBrowser = function() {
  io.emit('config', myConfiguration.mixerConfigToObject())
}
myEmitter.on('config.changed.mixer', sendConfigurationToBrowser)
myEmitter.on('config.changed.atem', sendConfigurationToBrowser)
myEmitter.on('config.changed.mock', sendConfigurationToBrowser)

// send events to tallies
myEmitter.on('program.changed', (programs, previews) => {
  myTallyDriver.setState(programs, previews)
})
myEmitter.on('tally.connected', (tally) => myTallyDriver.updateTally(tally.name))
myEmitter.on('tally.changed', (tally) => myTallyDriver.updateTally(tally.name))

// log stuff
myEmitter.on('tally.connected', tally => {
    console.info("Tally " + tally.name + " connected")
})
myEmitter.on('tally.changed', tally => {
    console.debug("Tally " + tally.name + " changed configuration")
})
myEmitter.on('tally.missing', tally => {
    console.warn("Tally " + tally.name + " went missing")
})
myEmitter.on('tally.timedout', tally => {
    console.warn("Tally " + tally.name + " timed out")
})
myEmitter.on('tally.removed', tally => {
    console.debug("Tally " + tally.name + " removed from configuration")
})
myEmitter.on('config.changed.mixer', mixerSelection => {
    console.info("configured mixer was changed to \"" + mixerSelection + "\"")
})
myEmitter.on('config.changed.atem', () => {
    console.info("configuration of ATEM was changed")
})
myEmitter.on('config.changed.mock', () => {
    console.info("configuration of Mock was changed")
})
myEmitter.on('program.changed', (programs, previews) => {
    console.info("Program/Preview was changed to ", programs, previews)
})

// socket.io server
io.on('connection', socket => {
  socket.on('tally.patch', (tallyName, channelId) => {
    myTallyDriver.patchTally(tallyName, parseInt(channelId, 10))
  })
  socket.on('tally.highlight', (tallyName) => {
    myTallyDriver.highlight(tallyName)
  })
  socket.on('tally.remove', tallyName => {
    myTallyDriver.removeTally(tallyName)
  })
  socket.on('config.changeRequest', (selectedMixer, atemIp, atemPort, mockTickTime) => {
    myConfiguration.updateAtemConfig(atemIp, atemPort)
    myConfiguration.updateMockConfig(mockTickTime)
    myConfiguration.updateMixerSelection(selectedMixer)

    io.emit()
  })
})

nextApp.prepare().then(() => {
  app.get('/tallies', (req, res) => {
    res.json({
      programs: myMixerDriver.currentPrograms,
      previews: myMixerDriver.currentPreviews,
      tallies: myTallyDriver.toValueObjects(),
    })
  })
  app.get('/atem', (req, res) => {
    const data = myConfiguration.mixerConfigToObject()
    data.allowedMixers = MixerDriver.getAllowedMixers(myConfiguration.isDev())
    res.json(data)
  })

  app.use('/lato', express.static(__dirname + '/node_modules/lato-font/css/'));
  app.use('/fonts', express.static(__dirname + '/node_modules/lato-font/fonts/'));

  app.get('*', (req, res) => {
    return nextHandler(req, res)
  })

  server.listen(myConfiguration.getHttpPort(), err => {
    if (err) throw err
    console.log(`Web Server available on http://localhost:${myConfiguration.getHttpPort()}`)
  })
})
