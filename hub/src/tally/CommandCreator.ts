import Tally, { UdpTally } from "../domain/Tally";
import { ChannelList } from "../lib/MixerCommunicator";
import ColorSchemes, { Black, Color } from "./ColorScheme";
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
    let opColor: Color
    let stColor: Color
    let flashPattern: number = 0
    let stepDuration: number = 0

    const state = this.getState(tally, programs, previews)
    const stColorScheme = ColorSchemes.getById(tally.configuration.getStageColorScheme() || defaultConfiguration.getStageColorScheme())
    const opColorScheme = ColorSchemes.getById(tally.configuration.getOperatorColorScheme() || defaultConfiguration.getOperatorColorScheme())
    if(state === "highlight") {
      opColor = opColorScheme.highlight
      stColor = stColorScheme.highlight
      flashPattern = 0xAA
      stepDuration = 125
    } else if (state === "on-air") {
      opColor = opColorScheme.program
      stColor = stColorScheme.program
    } else if (state === "preview") {
      opColor = opColorScheme.preview
      stColor = stColorScheme.preview
    } else if (state === "release") {
      opColor = opColorScheme.idle
      stColor = Black
    } else if (state === "unknown") {
      opColor = opColorScheme.unknown
      stColor = Black
      flashPattern = 0x80
      stepDuration = 250
    } else {
      // typescript will fail if we missed a case
      ((_:never) => {})(state)
    }

    const operatorBrightness = tally.configuration.getOperatorLightBrightness() !== undefined ? tally.configuration.getOperatorLightBrightness() : defaultConfiguration.getOperatorLightBrightness()
    opColor = opColor.withBrightness(operatorBrightness)

    const stageBrightness = tally.configuration.getStageLightBrightness() !== undefined ? tally.configuration.getStageLightBrightness() : defaultConfiguration.getStageLightBrightness()
    stColor = stColor.withBrightness(stageBrightness)

    let command = `O${opColor.r.toString().padStart(3, "0")}/${opColor.g.toString().padStart(3, "0")}/${opColor.b.toString().padStart(3, "0")} `+
      `S${stColor.r.toString().padStart(3, "0")}/${stColor.g.toString().padStart(3, "0")}/${stColor.b.toString().padStart(3, "0")}`
    if (flashPattern > 0 && stepDuration > 0) {
      command += ` 0x${flashPattern.toString(16).padStart(2, "0").toUpperCase()} ${stepDuration.toString().padStart(3, "0")}`
    }

    return command
  }
}

export default new CommandCreator()
