import Tally, { UdpTally } from "../domain/Tally";
import { ChannelList } from "../lib/MixerCommunicator";
import { DefaultTallyConfiguration } from "./TallyConfiguration";

export type StateCommand = "highlight" | "unknown" | "on-air" | "preview" | "release"



class Color {
  r: number
  g: number
  b: number

  constructor(r: number, g: number, b: number) {
    this.r = r
    this.g = g
    this.b = b
  }

  private calculateChannel(value: number, brightness: number) {
    return Math.ceil(value * brightness / 100)
  }

  // brightness: 0-100
  withBrightness(brightness: number) {
    return new Color(this.calculateChannel(this.r, brightness), this.calculateChannel(this.g, brightness), this.calculateChannel(this.b, brightness))
  }
}
type ColorScheme = {
  program: Color
  preview: Color
  highlight: Color
  unknown: Color
  idle: Color
}
const black : Color = new Color(0, 0, 0)
const defaultColorScheme: ColorScheme = {
  program: new Color(255, 0, 0),
  preview: new Color(0, 255, 0),
  highlight: new Color(255, 255, 255),
  unknown: new Color(0, 0, 255),
  idle: new Color(0, 1, 0),
}

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
    const colorScheme = defaultColorScheme
    if(state === "highlight") {
      opColor = colorScheme.highlight
      stColor = colorScheme.highlight
      flashPattern = 0xAA
      stepDuration = 125
    } else if (state === "on-air") {
      opColor = colorScheme.program
      stColor = colorScheme.program
    } else if (state === "preview") {
      opColor = colorScheme.preview
      stColor = colorScheme.preview
    } else if (state === "release") {
      opColor = colorScheme.idle
      stColor = black
    } else if (state === "unknown") {
      opColor = colorScheme.unknown
      stColor = black
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
