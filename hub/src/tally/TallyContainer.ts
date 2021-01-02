import Log from "../domain/Log"
import Tally from "../domain/Tally"
import { AppConfiguration } from "../lib/AppConfiguration"
import { ChannelList } from "../lib/MixerCommunicator"
import ServerEventEmitter from "../lib/ServerEventEmitter"
import UdpTallyDriver from "./UdpTallyDriver"

class TallyContainer {
  tallies: Map<string, Tally>
  emitter: ServerEventEmitter
  lastPrograms: ChannelList
  lastPreviews: ChannelList
  configuration: AppConfiguration
  udpTallyDriver?: UdpTallyDriver

  constructor(configuration: AppConfiguration, emitter: ServerEventEmitter) {
      this.configuration = configuration
      this.tallies = new Map();
      (configuration.getTallies() || []).forEach(tally => {
          this.tallies.set(tally.name, tally)
      })
      this.emitter = emitter
      this.lastPrograms = null
      this.lastPreviews = null

      this.emitter.on("program.changed", ({programs, previews}) => {
        this.lastPrograms = programs
        this.lastPreviews = previews
        this.updateTallyStates()
      })
  }

  addUdpTallyDriver(tallyDriver: UdpTallyDriver) {
    this.udpTallyDriver = tallyDriver
  }

  private setTally(tally: Tally) {
    const oldConfigAsJson = this.get(tally.name)?.toJsonForSave()
    this.tallies.set(tally.name, tally)
    this.updateTallyState(tally.name)
    this.emitter.emit('tally.changed', tally)

    const newConfigAsJson = this.get(tally.name)?.toJsonForSave()
    if (oldConfigAsJson !== newConfigAsJson) {
      this.configuration.setTallies(Array.from(this.tallies.values()))
    }
  }

  remove(tallyName: string) {
    const tally = this.tallies.get(tallyName)
    if(tally) {
        this.tallies.delete(tallyName)
        this.configuration.setTallies(Array.from(this.tallies.values()))
        console.debug(`Removed tally "${tallyName}"`)
        this.emitter.emit('tally.removed', tally)
    }
}

  get(tallyName: string) {
    const tally = this.tallies.get(tallyName)
    return tally
  }

  getOrCreate(tallyName: string) {
    let tally = this.tallies.get(tallyName)
    if (!tally) {
      tally = new Tally(tallyName)
      this.tallies.set(tally.name, tally)
      this.updateTallyState(tally.name)
      console.debug(`Tally "${tallyName}" created`)
      this.emitter.emit('tally.created', tally)
      this.configuration.setTallies(Array.from(this.tallies.values()))
    }
    return tally
  }

  update(tally: Tally) {
    // make sure the old tally existed - or create it
    this.getOrCreate(tally.name)
    this.setTally(tally)
    console.debug(`Tally "${tally.name}" updated`)
  }

  highlight(tallyName: string) {
      const tally = this.tallies.get(tallyName)
      if (tally) {
          console.debug(`Tally "${tally.name}" highlighted`)
          setTimeout(() => {
            this.deHighlight(tally.name)
          }, this.configuration.getTallyHighlightTime())
          tally.setHighlight(true)
          this.setTally(tally)
      } else {
        console.warn(`Can not highlight unknown tally named "${tallyName}"`)
      }
  }

  private deHighlight(tallyName: string) {
    const tally = this.tallies.get(tallyName)
    if (tally) {
        console.debug(`Tally "${tally.name}" de-highlighted`)
        tally.setHighlight(false)
        this.setTally(tally)
    } else {
      console.warn(`Can not unhighlight unknown tally named "${tallyName}"`)
    }
  }

  patch(tallyName: string, channelId: string|null) {
      const tally = this.tallies.get(tallyName)
      if (tally) {
          tally.channelId = channelId ? channelId : undefined
          this.setTally(tally)
          console.debug(`Tally "${tally.name}" patched to "${channelId}"`)
      } else {
        console.warn(`Can not patch unknown tally named "${tallyName}"`)
      }
  }

  addLog(tallyName: string, log: Log) {
      const tally = this.tallies.get(tallyName)
      if(tally) {
          tally.addLog(log)
          this.emitter.emit('tally.logged', {tally, log})
      } else {
        console.warn(`Can not log for unknown tally named "${tallyName}"`)
      }
  }

  private updateTallyState(tallyName: string) {
      const tally = this.tallies.get(tallyName)
      if (tally) {
          if (!this.udpTallyDriver) {
              console.warn(`No UDP Tally Driver initialized. Can not update state of Tally "${tallyName}"`)
          } else {
            this.udpTallyDriver.updateTallyState(tally, this.lastPrograms, this.lastPreviews)
          }
      }
  }
  private updateTallyStates() {
      this.tallies.forEach(tally => this.updateTallyState(tally.name))
  }

  getTallies() {
      return Array.from(this.tallies.values())
  }
  getTalliesAsJson() {
      return this.getTallies().map(tally => tally.toJson())
  }

}

export default TallyContainer
