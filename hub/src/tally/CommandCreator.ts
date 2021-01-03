import Tally, { UdpTally } from "../domain/Tally";
import { ChannelList } from "../lib/MixerCommunicator";
import { DefaultTallyConfiguration } from "./TallyConfiguration";

export type StateCommand = "highlight" | "unknown" | "on-air" | "preview" | "release"

class CommandCreator {
  getState(tally: Tally, programs: ChannelList, previews: ChannelList): StateCommand {
    if(tally.isHighlighted()) {
        return "highlight"
    } else if(programs === null && tally.isPatched()) {
        // mixer is disconnected
        return "unknown"
    } else if (programs !== null && tally.isIn(programs)) {
        return "on-air"
    } else if (previews !== null && tally.isIn(previews)) {
        return "preview"
    }

    return "release"
  }

  createStateCommand(tally: UdpTally, programs: ChannelList, previews: ChannelList, defaultConfiguration: DefaultTallyConfiguration): string {
    let command = this.getState(tally, programs, previews)
    command += ` ob=${tally.configuration.getOperatorLightBrightness() !== undefined ? tally.configuration.getOperatorLightBrightness() : defaultConfiguration.getOperatorLightBrightness()}`

    if (tally.hasStageLight) {
      command += ` sb=${tally.configuration.getStageLightBrightness() !== undefined ? tally.configuration.getStageLightBrightness() : defaultConfiguration.getStageLightBrightness()}`
    }
    
    return command
  }
}

export default new CommandCreator()
