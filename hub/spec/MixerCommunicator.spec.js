const MixerCommunicator = require('../lib/MixerCommunicator.js')
const Configuration = require('../lib/Configuration.js')
const EventEmitter = require('events')

describe('MixerCommunicator', () => {
    describe('notifyProgramChanged', () => {
        test('sends an event and fills getters', () => {
            const emitter = new EventEmitter()
            let eventSeen = 0

            let expectedPrograms = [1]
            let expectedPreviews = [2]
            emitter.on("program.changed", (programs, previews) => {
                eventSeen++
                expect(programs).toEqual(expectedPrograms)
                expect(previews).toEqual(expectedPreviews)
            })
            const config = new Configuration("does_not_exist.json", emitter)

            const communicator = new MixerCommunicator(config, emitter)

            expect(eventSeen).toEqual(0)
            communicator.notifyProgramChanged([1], [2])
            expect(eventSeen).toEqual(1)
            expect(communicator.getCurrentPrograms()).toEqual([1])
            expect(communicator.getCurrentPreviews()).toEqual([2])

            expectedPreviews = null
            expectedPrograms = null
            communicator.notifyProgramChanged(null, null)
            expect(eventSeen).toEqual(2)
            expect(communicator.getCurrentPrograms()).toEqual(null)
            expect(communicator.getCurrentPreviews()).toEqual(null)
        })
        test('debounces', () => {
            const emitter = new EventEmitter()
            let eventSeen = 0
            emitter.on("program.changed", _ => eventSeen++)
            const config = new Configuration("does_not_exist.json", emitter)

            const communicator = new MixerCommunicator(config, emitter)

            expect(eventSeen).toEqual(0)
            communicator.notifyProgramChanged([1], [2])
            expect(eventSeen).toEqual(1)
            // same settings again
            communicator.notifyProgramChanged([1], [2])
            expect(eventSeen).toEqual(1)
            // preview has changed
            communicator.notifyProgramChanged([1], [3])
            expect(eventSeen).toEqual(2)
            // program has changed
            communicator.notifyProgramChanged([2], [3])
            expect(eventSeen).toEqual(3)
            // preview added
            communicator.notifyProgramChanged([2], [3,4])
            expect(eventSeen).toEqual(4)
            // same settings again
            communicator.notifyProgramChanged([2], [3,4])
            expect(eventSeen).toEqual(4)
            // program removed
            communicator.notifyProgramChanged([], [3,4])
            expect(eventSeen).toEqual(5)
            // same settings again
            communicator.notifyProgramChanged([], [3,4])
            expect(eventSeen).toEqual(5)
        })
    })
    describe('notifyChannelNames', () => {
        test('sends an event', () => {
            const emitter = new EventEmitter()
            let eventSeen = 0

            emitter.on("config.changed", () => eventSeen++)
            const config = new Configuration("does_not_exist.json", emitter)
            config.save = () => {} // mock it away

            const communicator = new MixerCommunicator(config, emitter)

            expect(eventSeen).toEqual(0)

            communicator.notifyChannelNames(3)
            expect(eventSeen).toEqual(1)
            expect(config.getChannels()).toHaveLength(3)

            communicator.notifyChannelNames(3, {1: "foobar", 2: "baz", 3: "bar"})
            expect(eventSeen).toEqual(2)
            expect(config.getChannels()).toHaveLength(3)
            expect(config.getChannels().map(c => c.name)).toEqual(["foobar", "baz", "bar"])

            // can be nulled
            communicator.notifyChannelNames(null, null)
            expect(eventSeen).toEqual(3)
            expect(config.getChannels()).not.toHaveLength(3)
            expect(config.getChannels()).toEqual([])
        })
        test('debounces', () => {
            const emitter = new EventEmitter()
            let eventSeen = 0

            emitter.on("config.changed", () => eventSeen++)
            const config = new Configuration("does_not_exist.json", emitter)
            config.save = () => {} // mock it away

            const communicator = new MixerCommunicator(config, emitter)

            expect(eventSeen).toEqual(0)

            communicator.notifyChannelNames(3)
            expect(eventSeen).toEqual(1)
            // do it again
            communicator.notifyChannelNames(3)
            expect(eventSeen).toEqual(1)
            // add channels
            communicator.notifyChannelNames(3, {1: "foobar", 2: "baz", 3: "bar"})
            expect(eventSeen).toEqual(2)
            // do it again
            communicator.notifyChannelNames(3, {1: "foobar", 2: "baz", 3: "bar"})
            expect(eventSeen).toEqual(2)
            // change in name
            communicator.notifyChannelNames(3, {1: "blubber", 2: "baz", 3: "bar"})
            expect(eventSeen).toEqual(3)
            // do it again
            communicator.notifyChannelNames(3, {1: "blubber", 2: "baz", 3: "bar"})
            expect(eventSeen).toEqual(3)
            // remove channel
            communicator.notifyChannelNames(2, {1: "blubber", 2: "baz"})
            expect(eventSeen).toEqual(4)
            // add channels
            communicator.notifyChannelNames(4, {1: "blubber", 2: "baz", 3: "bar", 4: "bluna"})
            expect(eventSeen).toEqual(5)
        })
    })
    describe('notifyMixerIsConnected/Disconnected', () => {
        test('sends an event', () => {
            const emitter = new EventEmitter()
            let connectEventSeen = 0
            let disconnectEventSeen = 0

            emitter.on("mixer.connected", () => connectEventSeen++)
            emitter.on("mixer.disconnected", () => disconnectEventSeen++)
            const config = new Configuration("does_not_exist.json", emitter)
            config.save = () => {} // mock it away

            const communicator = new MixerCommunicator(config, emitter)

            expect(connectEventSeen).toEqual(0)
            expect(disconnectEventSeen).toEqual(0)

            communicator.notifyMixerIsConnected()
            expect(connectEventSeen).toEqual(1)
            expect(disconnectEventSeen).toEqual(0)

            communicator.notifyMixerIsDisconnected()
            expect(connectEventSeen).toEqual(1)
            expect(disconnectEventSeen).toEqual(1)
        })
        test('debounces', () => {
            const emitter = new EventEmitter()
            let connectEventSeen = 0
            let disconnectEventSeen = 0

            emitter.on("mixer.connected", () => connectEventSeen++)
            emitter.on("mixer.disconnected", () => disconnectEventSeen++)
            const config = new Configuration("does_not_exist.json", emitter)
            config.save = () => {} // mock it away

            const communicator = new MixerCommunicator(config, emitter)

            expect(connectEventSeen).toEqual(0)
            expect(disconnectEventSeen).toEqual(0)

            communicator.notifyMixerIsConnected()
            expect(connectEventSeen).toEqual(1)
            expect(disconnectEventSeen).toEqual(0)
            communicator.notifyMixerIsConnected()
            expect(connectEventSeen).toEqual(1)
            expect(disconnectEventSeen).toEqual(0)
            communicator.notifyMixerIsConnected()
            expect(connectEventSeen).toEqual(1)
            expect(disconnectEventSeen).toEqual(0)

            communicator.notifyMixerIsDisconnected()
            expect(connectEventSeen).toEqual(1)
            expect(disconnectEventSeen).toEqual(1)
            communicator.notifyMixerIsDisconnected()
            expect(connectEventSeen).toEqual(1)
            expect(disconnectEventSeen).toEqual(1)

            communicator.notifyMixerIsConnected()
            expect(connectEventSeen).toEqual(2)
            expect(disconnectEventSeen).toEqual(1)
        })
    })
    
})
