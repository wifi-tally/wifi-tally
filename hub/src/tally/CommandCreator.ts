import Tally from "../domain/Tally";
import { ChannelList } from "../lib/MixerCommunicator";

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

  createStateCommand(tally: Tally, programs: ChannelList, previews: ChannelList): string {
    return this.getState(tally, programs, previews)
  }
}

export default new CommandCreator()
