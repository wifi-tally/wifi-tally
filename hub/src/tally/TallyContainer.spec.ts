import TallyContainer from './TallyContainer'
import { EventEmitter } from "events";
import ServerEventEmitter from '../lib/ServerEventEmitter';
import { AppConfiguration } from '../lib/AppConfiguration';

test('it writes changes to configuration', () => {
    const emitter = new ServerEventEmitter()
    const configuration = new AppConfiguration(emitter)
    const container = new TallyContainer(configuration, emitter)

    // check that it is initially empty
    expect(configuration.getTallies()).toEqual([])

    const tally = container.getOrCreate("Foobar")

    // tally was created
    expect(configuration.getTallies()).toHaveLength(1)
    expect(configuration.getTallies()[0].name).toEqual("Foobar")
    expect(configuration.getTallies()[0].channelId).toBe(undefined)

    tally.channelId = "42"
    container.update(tally)
    expect(configuration.getTallies()).toHaveLength(1)
    expect(configuration.getTallies()[0].name).toEqual("Foobar")
    expect(configuration.getTallies()[0].channelId).toEqual("42")

    container.remove(tally.name)
    expect(configuration.getTallies()).toEqual([])
})