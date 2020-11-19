const TallyDriver = require('./TallyDriver')

describe('TallyDriver', () => {
    describe('parseTallyHo', () => {
        test('parses a simple command', () => {
            const name = TallyDriver.parseTallyHo('tally-ho "Tally Name"')
            expect(name).toBe("Tally Name")
        })
        test('fails if command is invalid #1', () => {
            expect(() => {
                TallyDriver.parseTallyHo("this is an invalid command")
            }).toThrowError("Received an invalid command: \"this is an invalid command\"")
        })
        test('fails if command is invalid #2', () => {
            expect(() => {
                TallyDriver.parseTallyHo("tally-ho Tally")
            }).toThrowError("Received an invalid command: \"tally-ho Tally\"")
        })
    })
    describe('parseLog', () => {
        test('parses a info log', () => {
            const [name, severity, message] = TallyDriver.parseLog('log "Tally Name" INFO "Hello World"')
            expect(name).toBe("Tally Name")
            expect(severity).toBe("INFO")
            expect(message).toBe("Hello World")
        })
        test('fails if command is invalid #1', () => {
            expect(() => {
                TallyDriver.parseLog("this is an invalid command")
            }).toThrowError("Received an invalid command: \"this is an invalid command\"")
        })
        test('fails if command is invalid #2', () => {
            expect(() => {
                TallyDriver.parseLog("log this invalid log")
            }).toThrowError("Received an invalid command: \"log this invalid log\"")
        })
    })
    
})
