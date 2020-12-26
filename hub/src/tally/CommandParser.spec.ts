import CommandParser from './CommandParser'
import { LogCommand, TallyHoCommand } from './Commands'


test('fails if command is invalid #1', () => {
    expect(() => {
        CommandParser.parse("this is an invalid command")
    }).toThrowError("Received an invalid command: \"this is an invalid command\"")
})

describe('tally-ho command', () => {
    test('parses a simple command', () => {
        const result = CommandParser.parse('tally-ho "Tally Name"')

        expect(result.command).toEqual("tally-ho")
        const { tallyName } = result as TallyHoCommand
        expect(tallyName).toBe("Tally Name")
    })
    test('fails if command is invalid', () => {
        expect(() => {
            CommandParser.parse("tally-ho Tally")
        }).toThrowError("Received an invalid command: \"tally-ho Tally\"")
    })
})
describe('log command', () => {
    test('parses an info log', () => {
        const result = CommandParser.parse('log "Tally Name" INFO "Hello World"')

        expect(result.command).toEqual("log")
        const { tallyName, severity, message } = result as LogCommand
        expect(tallyName).toBe("Tally Name")
        expect(severity).toBe("INFO")
        expect(message).toBe("Hello World")
    })
    test('logs as error if log level is invalid', () => {
        const result = CommandParser.parse('log "Tally Name" UNKNOWN "Hello World"')
        expect(result.command).toEqual("log")
        const { tallyName, severity, message } = result as LogCommand
        expect(tallyName).toBe("Tally Name")
        expect(severity).toBe("ERROR")
        expect(message).toBe("Hello World")
    })
    test('fails if command is invalid', () => {
        expect(() => {
            CommandParser.parse("log this invalid log")
        }).toThrowError("Received an invalid command: \"log this invalid log\"")
    })
})
