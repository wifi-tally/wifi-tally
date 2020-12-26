import Tally from "../domain/Tally";
import { ChannelList } from "../lib/MixerCommunicator";

class CommandCreator {
  createStateCommand(tally: Tally, programs: ChannelList, previews: ChannelList): string {
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
}

export default new CommandCreator()
