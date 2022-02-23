
export type ColorSchemeId = "default" | "yellow-pink"

export class Color {
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

  toCss() {
    return `rgb(${this.r},${this.g},${this.b})`
  }
}

export type ColorScheme = {
  id: ColorSchemeId
  name: string
  description?: string
  program: Color
  preview: Color
  highlight: Color
  unknown: Color
  idle: Color
}

export const Black : Color = new Color(0, 0, 0)

export const DefaultColorScheme: ColorScheme = {
  id: "default",
  name: "Default",
  description: "The traditional color scheme for Tally Lights.",
  program: new Color(255, 0, 0),
  preview: new Color(0, 255, 0),
  highlight: new Color(255, 255, 255),
  unknown: new Color(0, 0, 255),
  idle: new Color(0, 0, 1),
}
export const YellowPinkColorScheme: ColorScheme = {
  id: "yellow-pink",
  name: "Yellow-Pink",
  description: "Intended to give better contrast for the red-green color blind (Protanopia, Deuteranopia).",
  program: new Color(255, 255, 0),
  preview: new Color(255, 0, 255),
  highlight: new Color(255, 255, 255),
  unknown: new Color(0, 0, 255),
  idle: new Color(0, 0, 1),
}

const ColorSchemes = {
  getAll() {
    return [DefaultColorScheme, YellowPinkColorScheme]
  },
  getById(id: ColorSchemeId) : ColorScheme {
    if (id === "default") {
      return DefaultColorScheme
    } else if (id === "yellow-pink") {
      return YellowPinkColorScheme
    } else {
      // if typescript complaints, we missed an option
      ((_:never) => {})(id)
    }
  }
}

export default ColorSchemes
