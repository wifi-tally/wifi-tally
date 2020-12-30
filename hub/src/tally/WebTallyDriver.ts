import { WebTally } from '../domain/Tally'
import { AppConfiguration } from '../lib/AppConfiguration'
import TallyContainer from './TallyContainer'

// - handles connections with Web Tallies
// - emits signals when tallies connect or disconnect
// - sends current state to Web Tallies
class WebTallyDriver {
    container: TallyContainer
    configuration: AppConfiguration

    constructor(configuration: AppConfiguration, container: TallyContainer) {
        this.configuration = configuration
        this.container = container
        this.container.addWebTallyDriver(this)
    }

    updateTallyState(tally: WebTally, lastPrograms: string[], lastPreviews: string[]) {
      // @TODO
    }
    create(tallyName: string, channelId: string) {
      const tally = this.container.getOrCreate(tallyName, "web") as WebTally
      tally.name = tallyName
      tally.channelId = channelId || undefined
      this.container.update(tally)
    }
}

export default WebTallyDriver