import escapeString from 'escape-string-regexp'

class TallySettingsIni {

  lines: string[]

  constructor(data: string = "") {
    this.lines = data.split("\n").reverse()
    if (this.lines[0] === '') {
      this.lines.shift()
    }
  }

  /**
   * returns the line number where this setting is in the current file
   * 
   * @param name name of the setting
   */
  private findSetting(name: string): number {
    const matcher = new RegExp(`^${escapeString(name)}\\s*=`)
    const lineIdx = this.lines.findIndex(line => line.match(matcher))
    if (lineIdx !== -1) {
      return lineIdx
    } else {
      return null
    }
  }

  private readSetting(name: string): string {
    const lineIdx = this.findSetting(name)
    if (lineIdx !== null) {
      const line = this.lines[lineIdx]
      const idx = line.indexOf("=")
      const value = line.substr(idx+1)
      return value
    } else {
      return null
    }
  }

  private writeSetting(name: string, value: string) {
    const line = `${name}=${value}`
    const lineIdx = this.findSetting(name)
    
    if (lineIdx !== null) {
      this.lines[lineIdx] = line
    } else {
      this.lines.unshift(line)
    }
  }

  getStationSsid(): string {
    return this.readSetting("station.ssid")
  }
  setStationSsid(ssid: string) {
    this.writeSetting("station.ssid", ssid)
  }
  getStationPassword(): string {
    return this.readSetting("station.password")
  }
  setStationPassword(password: string) {
    this.writeSetting("station.password", password)
  }
  getHubIp(): string {
    return this.readSetting("hub.ip")
  }
  setHubIp(ip: string) {
    this.writeSetting("hub.ip", ip)
  }
  getHubPort(): number {
    const port = this.readSetting("hub.port")
    if(port !== null) {
      return parseInt(port, 10)
    } else {
      return null
    }
  }
  setHubPort(port: number) {
    this.writeSetting("hub.port", port.toString())
  }
  getTallyName(): string {
    return this.readSetting("tally.name")
  }
  setTallyName(name: string) {
    this.writeSetting("tally.name", name)
  }
  
  toString(): string {
    const lines = Array.from(this.lines)
    lines.reverse()
    lines.push('') // newline at end
    return lines.join("\n")
  }

  clone(): TallySettingsIni {
    return new TallySettingsIni(this.toString())
  }

}

export default TallySettingsIni
