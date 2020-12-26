export type TallyHoCommand = {
  command: "tally-ho"
  tallyName: string
}

export type LogCommand = {
  command: "log"
  tallyName: string
  severity: "INFO" | "WARN" | "ERROR"
  message: string
}

export type TallySentCommand = TallyHoCommand | LogCommand

export class InvalidCommandError extends Error {
  constructor(...args) {
      super(...args)

      this.message = `Received an invalid command: "${this.message}"`
  }
}

class TallyCommandParser {
  parse(msg: string): TallySentCommand {
    if (msg.startsWith("tally-ho ")) {
        return this.parseTallyHo(msg)
    } else if (msg.startsWith("log ")) {
        return this.parseLog(msg)
    } else {
        throw new InvalidCommandError(msg)
    }
  }

  private parseTallyHo = function(cmd: string) : TallyHoCommand {
    const result = cmd.match(/^([^ ]+) "(.+)"/)
    if (result === null) {
        throw new InvalidCommandError(cmd)
    } else {
        const [_, command, tallyName] = result
        if (command !== "tally-ho") {
            throw new InvalidCommandError(command)
        }
        return { command, tallyName }
    }
  }

  private parseLog = function(cmd: string) : LogCommand {
    const result = cmd.match(/^([^ ]+) "(.+)" ([^ ]+) "(.*)"/)

    if (result === null) {
        throw new InvalidCommandError(cmd)
    } else {
        const [_, command, tallyName, uncleanSeverity, message] = result
        if (command !== "log") {
            throw  new InvalidCommandError(command)
        }
        const severity = (() => {
          if (uncleanSeverity === "INFO" || uncleanSeverity === "WARN" || uncleanSeverity === "ERROR") {
            return uncleanSeverity
          } else {
            console.log(`Invalid severity "${uncleanSeverity}". Using ERROR instead.`)
            return "ERROR"
          }
        })()
        return { command, tallyName, severity, message }
    }
  }
}

export default new TallyCommandParser()
