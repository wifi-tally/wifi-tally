import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import MockSettings from './MockSettings';
import DisconnectedClientSideSocket from '../../../lib/DisconnectedClientSideSocket';
import { socket } from '../../../hooks/useSocket'
import MockConfiguration from '../MockConfiguration';
import { act } from 'react-dom/test-utils';


beforeEach(() => {
    (socket as DisconnectedClientSideSocket).cleanUp()
})
afterEach(() => {
    (socket as DisconnectedClientSideSocket).cleanUp()
})

test('it shows the data', () => {
    const { getByTestId } = render(<MockSettings />)
    const config = new MockConfiguration()
    config.setTickTime(1234)
    config.setChannelCount(4)
    config.setChannelNames(["John", "Paul", "George", "Ringo"])
    act(() => {
        (socket as DisconnectedClientSideSocket).emitServerEvent('config.state.mock', config.toJson())
    })

    const tickTime = getByTestId("tick-time")
    const channelCount = getByTestId("channel-count")
    const channelNames = getByTestId("channel-names")

    expect(tickTime.value).toEqual("1234")
    expect(channelCount.value).toEqual("4")
    expect(channelNames.value).toEqual("John, Paul, George, Ringo")
})

test('it updates the data on changes on the server', () => {
    const { getByTestId } = render(<MockSettings />)
    const config = new MockConfiguration()
    config.setTickTime(1234)
    config.setChannelCount(4)
    config.setChannelNames(["John", "Paul", "George", "Ringo"])
    act(() => {
        (socket as DisconnectedClientSideSocket).emitServerEvent('config.state.mock', config.toJson())
    })
    
    const tickTime = getByTestId("tick-time")
    const channelCount = getByTestId("channel-count")
    const channelNames = getByTestId("channel-names")

    expect(tickTime.value).toEqual("1234")
    expect(channelCount.value).toEqual("4")
    expect(channelNames.value).toEqual("John, Paul, George, Ringo")

    const config2 = new MockConfiguration()
    config2.setTickTime(2000)
    config2.setChannelCount(2)
    config2.setChannelNames(["Asterix", "Obelix"])
    act(() => {
        (socket as DisconnectedClientSideSocket).emitServerEvent('config.state.mock', config2.toJson())
    })

    expect(tickTime.value).toEqual("2000")
    expect(channelCount.value).toEqual("2")
    expect(channelNames.value).toEqual("Asterix, Obelix")
})

test('it discards all user changes when values on the server are changed', () => {
    const { getByTestId } = render(<MockSettings />)
    const config = new MockConfiguration()
    config.setTickTime(1234)
    config.setChannelCount(4)
    config.setChannelNames(["John", "Paul", "George", "Ringo"])
    act(() => {
        (socket as DisconnectedClientSideSocket).emitServerEvent('config.state.mock', config.toJson())
    })
    
    const tickTime = getByTestId("tick-time")
    const channelCount = getByTestId("channel-count")
    const channelNames = getByTestId("channel-names")

    expect(tickTime.value).toEqual("1234")
    expect(channelCount.value).toEqual("4")
    expect(channelNames.value).toEqual("John, Paul, George, Ringo")

    fireEvent.change(tickTime, { target: { value: "123" } })
    fireEvent.change(channelCount, { target: { value: "7" } })
    fireEvent.change(channelNames, { target: { value: "foo, bar" } })

    expect(tickTime.value).toEqual("123")
    expect(channelCount.value).toEqual("7")
    expect(channelNames.value).toEqual("foo, bar")

    const config2 = new MockConfiguration()
    config2.setTickTime(2000)
    config2.setChannelCount(2)
    config2.setChannelNames(["Asterix", "Obelix"])
    act(() => {
        (socket as DisconnectedClientSideSocket).emitServerEvent('config.state.mock', config2.toJson())
    })

    expect(tickTime.value).toEqual("2000")
    expect(channelCount.value).toEqual("2")
    expect(channelNames.value).toEqual("Asterix, Obelix")
})

test('it disables the save button on invalid data', () => {
    const { getByTestId, getByRole } = render(<MockSettings />)
    const config = new MockConfiguration()
    config.setTickTime(1234)
    config.setChannelCount(4)
    config.setChannelNames(["John", "Paul", "George", "Ringo"])
    act(() => {
        (socket as DisconnectedClientSideSocket).emitServerEvent('config.state.mock', config.toJson())
    })
    
    const tickTime = getByTestId("tick-time")
    const channelCount = getByTestId("channel-count")
    const channelNames = getByTestId("channel-names")
    const button = getByRole("button")

    expect(tickTime.value).toEqual("1234")
    expect(channelCount.value).toEqual("4")
    expect(channelNames.value).toEqual("John, Paul, George, Ringo")
    expect(button.disabled).toBe(false)

    fireEvent.change(tickTime, { target: { value: "invalid" } })
    expect(button.disabled).toBe(true)
})

test('it saves changes', () => {
    const { getByTestId, getByRole } = render(<MockSettings />)
    const config = new MockConfiguration()
    config.setTickTime(1234)
    config.setChannelCount(4)
    config.setChannelNames(["John", "Paul", "George", "Ringo"])
    act(() => {
        (socket as DisconnectedClientSideSocket).emitServerEvent('config.state.mock', config.toJson())
    })
    
    const tickTime = getByTestId("tick-time")
    const channelCount = getByTestId("channel-count")
    const channelNames = getByTestId("channel-names")
    const button = getByRole("button")

    fireEvent.change(tickTime, { target: { value: "2345" } })
    fireEvent.change(channelCount, { target: { value: "2" } })
    fireEvent.change(channelNames, { target: { value: "Asterix, Obelix" } })

    let gotConfigPojo
    let gotMixer

    (socket as DisconnectedClientSideSocket).onServerEvent('config.change.mock', (conf, mixer) => {
        gotConfigPojo = conf
        gotMixer = mixer
    })

    fireEvent.click(button)
    expect(gotConfigPojo).toBeTruthy()
    const gotConfig = new MockConfiguration()
    gotConfig.fromJson(gotConfigPojo)
    expect(gotConfig.getTickTime()).toEqual(2345)
    expect(gotConfig.getChannelCount()).toEqual(2)
    expect(gotConfig.getChannels().map(c => c.name)).toEqual(["Asterix", "Obelix"])
    expect(gotMixer).toEqual("mock")
})
