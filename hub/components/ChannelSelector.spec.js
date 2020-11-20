import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import ChannelSelector from './ChannelSelector';
import Channel from '../domain/Channel';
import '@testing-library/jest-dom';

test('it only renders the unpatched option by default', () => {
    const root = document.createElement('div')
    const { getByText, getAllByRole } = render(<ChannelSelector />, {
        container: document.body.appendChild(root)
    })
    expect(getByText('(unpatched)')).toBeInTheDocument()
    expect(getAllByRole('option')).toHaveLength(1)
})

test('it displays labels correctly', () => {
    const root = document.createElement('div')
    const channels = [
        new Channel(1, "Channel One"),
        new Channel("2", "Channel Two"),
        new Channel(3),
        new Channel("foobar"),
        new Channel("baz", "Channel 42"),
    ]
    const { getByText, getAllByRole } = render(<ChannelSelector channels={channels} />, {
        container: document.body.appendChild(root)
    })

    const el1 = getByText("Channel One")
    expect(el1).toBeInTheDocument()
    expect(el1.value).toBe("1")

    const el2 = getByText("Channel Two")
    expect(el2).toBeInTheDocument()
    expect(el2.value).toBe("2")

    const el3 = getByText("Channel 3")
    expect(el3).toBeInTheDocument()
    expect(el3.value).toBe("3")

    const el4 = getByText("Channel foobar")
    expect(el4).toBeInTheDocument()
    expect(el4.value).toBe("foobar")

    const el5 = getByText("Channel 42")
    expect(el5).toBeInTheDocument()
    expect(el5.value).toBe("baz")

    expect(getAllByRole('option')).toHaveLength(6) // one more for the (unpatched) option
})

test('it calls onChange with the right value', () => {
    const root = document.createElement('div')
    const channels = [
        new Channel(1, "Channel One"),
        new Channel("2", "Channel Two"),
        new Channel(3),
        new Channel("foobar"),
        new Channel("baz", "Channel 42"),
    ]
    let lastSeenValue
    const { getByText, getByRole } = render(<ChannelSelector channels={channels} onChange={val => lastSeenValue = val} />, {
        container: document.body.appendChild(root)
    })

    const select = getByRole("combobox")

    const el1 = getByText("Channel One")
    fireEvent.change(select, { target: { value: el1.value } })
    expect(lastSeenValue).toBe("1")
    expect(select).toHaveValue("1")

    const el2 = getByText("Channel Two")
    fireEvent.change(select, { target: { value: el2.value } })
    expect(lastSeenValue).toBe("2")
    expect(select).toHaveValue("2")

    const el3 = getByText("Channel 3")
    fireEvent.change(select, { target: { value: el3.value } })
    expect(lastSeenValue).toBe("3")
    expect(select).toHaveValue("3")

    const el4 = getByText("Channel foobar")
    fireEvent.change(select, { target: { value: el4.value } })
    expect(lastSeenValue).toBe("foobar")
    expect(select).toHaveValue("foobar")

    const el5 = getByText("Channel 42")
    fireEvent.change(select, { target: { value: el5.value } })
    expect(lastSeenValue).toBe("baz")
    expect(select).toHaveValue("baz")

    const el6 = getByText("(unpatched)")
    fireEvent.change(select, { target: { value: el6.value } })
    expect(lastSeenValue).toBe(null)
    expect(select).toHaveValue("")
})

test('it selects (unpatched) by default', () => {
    const root = document.createElement('div')
    const channels = [
        new Channel("1", "Channel One"),
        new Channel("2", "Channel Two"),
        new Channel("3", "Channel Three"),
    ]
    const { getByText, getByRole } = render(<ChannelSelector channels={channels} />, {
        container: document.body.appendChild(root)
    })

    const select = getByRole("combobox")
    expect(select).toHaveValue("")
})
test('it shows the key if the defaultId does not exist', () => {
    const root = document.createElement('div')
    const channels = [
        new Channel("1", "Channel One"),
        new Channel("2", "Channel Two"),
        new Channel("3", "Channel Three"),
    ]
    const { getByText, getByRole } = render(<ChannelSelector channels={channels} defaultSelect="4" />, {
        container: document.body.appendChild(root)
    })

    const select = getByRole("combobox")

    expect(select).toHaveValue("4")
    const el = getByText("Channel 4")
    expect(el).toBeInTheDocument()
})
