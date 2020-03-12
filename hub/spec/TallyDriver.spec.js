const TallyDriver = require('../lib/TallyDriver')

describe('TallyDriver', () => {
    describe('parseTallyHo', () => {
        test('parses a simple command', () => {
            const name = TallyDriver.parseTallyHo("tally-ho TallyName")
            expect(name).toBe("TallyName")
        })
        test('fails if command is invalid', () => {
            expect(() => {
                TallyDriver.parseTallyHo("this is an invalid command")
            }).toThrowError()
        })
    })
    describe('parseLog', () => {
        test('parses a info log', () => {
            const [name, severity, message] = TallyDriver.parseLog("log TallyName INFO Hello World")
            expect(name).toBe("TallyName")
            expect(severity).toBe("INFO")
            expect(message).toBe("Hello World")
        })
        test('fails if command is invalid', () => {
            expect(() => {
                TallyDriver.parseLog("this is an invalid command")
            }).toThrowError()
        })
    })
    
})
