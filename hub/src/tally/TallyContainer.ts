import Log from "../domain/Log"
import Tally, { TallyType, UdpTally, WebTally } from "../domain/Tally"
import { AppConfiguration } from "../lib/AppConfiguration"
import { ChannelList } from "../lib/MixerCommunicator"
import ServerEventEmitter from "../lib/ServerEventEmitter"
import UdpTallyDriver from "./UdpTallyDriver"
import WebTallyDriver from "./WebTallyDriver"

class TallyContainer {
  tallies: Map<string, Tally>
  emitter: ServerEventEmitter
  lastPrograms: ChannelList
  lastPreviews: ChannelList
  configuration: AppConfiguration
  udpTallyDriver?: UdpTallyDriver
  webTallyDriver?: WebTallyDriver

  constructor(configuration: AppConfiguration, emitter: ServerEventEmitter) {
      this.configuration = configuration
      this.tallies = new Map();
      (configuration.getTallies() || []).forEach(tally => {
          this.set(tally)
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
  addWebTallyDriver(tallyDriver: WebTallyDriver) {
    this.webTallyDriver = tallyDriver
  }

  private key(tallyName: string, tallyType: TallyType) {
    return `${tallyType}-${tallyName}`
  }

  private set(tally: Tally) {
    this.tallies.set(this.key(tally.name, tally.type), tally)
  }

  get(tallyName: string, tallyType: TallyType) {
    const tally = this.tallies.get(this.key(tallyName, tallyType))
    return tally
  }

  private setAndAnnounceTally(tally: Tally) {
    const oldConfigAsJson = this.get(tally.name, tally.type)?.toJsonForSave()
    this.set(tally)
    this.updateTallyState(tally)
    this.emitter.emit('tally.changed', tally)

    const newConfigAsJson = this.get(tally.name, tally.type)?.toJsonForSave()
    if (oldConfigAsJson !== newConfigAsJson) {
      this.configuration.setTallies(Array.from(this.tallies.values()))
    }
  }

  remove(tallyName: string, tallyType: TallyType) {
    const tally = this.get(tallyName, tallyType)
    if(tally) {
        this.tallies.delete(this.key(tally.name, tally.type))
        this.configuration.setTallies(Array.from(this.tallies.values()))
        console.debug(`Removed tally "${tallyName}"`)
        this.emitter.emit('tally.removed', tally)
    }
  }

  getOrCreate(tallyName: string, tallyType: TallyType) {
    let tally = this.get(tallyName, tallyType)
    if (!tally) {
      if (tallyType === "web") {
        tally = new WebTally(tallyName)
      } else {
        tally = new UdpTally(tallyName)
      }
      
      this.set(tally)
      this.updateTallyState(tally)
      console.debug(`Tally "${tallyName}" created`)
      this.emitter.emit('tally.created', tally)
      this.configuration.setTallies(Array.from(this.tallies.values()))
    }
    return tally
  }

  update(tally: Tally) {
    // make sure the old tally existed - or create it
    this.getOrCreate(tally.name, tally.type)
    this.setAndAnnounceTally(tally)
    console.debug(`Tally "${tally.name}" updated`)
  }

  highlight(tallyName: string, tallyType: TallyType) {
      const tally = this.get(tallyName, tallyType)
      if (tally) {
          console.debug(`Tally "${tally.name}" highlighted`)
          setTimeout(() => {
            this.deHighlight(tallyName, tallyType)
          }, this.configuration.getTallyHighlightTime())
          tally.setHighlight(true)
          this.setAndAnnounceTally(tally)
      } else {
        console.warn(`Can not highlight unknown tally named "${tallyName}"`)
      }
  }

  private deHighlight(tallyName: string, tallyType: TallyType) {
    const tally = this.get(tallyName, tallyType)
    if (tally) {
        console.debug(`Tally "${tally.name}" de-highlighted`)
        tally.setHighlight(false)
        this.setAndAnnounceTally(tally)
    } else {
      console.warn(`Can not unhighlight unknown tally named "${tallyName}"`)
    }
  }

  patch(tallyName: string, tallyType: TallyType, channelId: string|null) {
      const tally = this.get(tallyName, tallyType)
      if (tally) {
          tally.channelId = channelId ? channelId : undefined
          this.setAndAnnounceTally(tally)
          console.debug(`Tally "${tally.name}" patched to "${channelId}"`)
      } else {
          console.warn(`Can not patch unknown tally named "${tallyName}"`)
      }
  }

  addLog(tallyName: string, tallyType: TallyType, log: Log) {
      const tally = this.get(tallyName, tallyType)
      if(tally) {
          tally.addLog(log)
          this.emitter.emit('tally.logged', {tally, log})
      } else {
        console.warn(`Can not log for unknown tally named "${tallyName}"`)
      }
  }

  private updateTallyState(tally: Tally) {
      if (tally) {
          if (tally.isUdpTally()) {
              if (!this.udpTallyDriver) {
                  console.warn(`No UDP Tally Driver initialized. Can not update state of Tally "${tally.name}"`)
              } else {
                  this.udpTallyDriver.updateTallyState(tally, this.lastPrograms, this.lastPreviews)
              }
          } else if (tally.isWebTally()) {
            if (!this.webTallyDriver) {
                console.warn(`No Web Tally Driver initialized. Can not update state of Tally "${tally.name}"`)
            } else {
                this.webTallyDriver.updateTallyState(tally, this.lastPrograms, this.lastPreviews)
            }
          }
      }
  }
  private updateTallyStates() {
      this.tallies.forEach(tally => this.updateTallyState(tally))
  }

  getTallies() {
      return Array.from(this.tallies.values())
  }

  getUdpTallies() {
    return this.getTallies().reduce((results, tally) => {
      if(tally.isUdpTally()) {
        results.push(tally)
      }
      return results
    }, [] as UdpTally[])
  }

  getTalliesAsJson() {
      return this.getTallies().map(tally => tally.toJson())
  }

}

export default TallyContainer
