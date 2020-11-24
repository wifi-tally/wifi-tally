import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import InputIp from './InputIp';
import '@testing-library/jest-dom';
import { IpAddress } from '../../domain/IpAddress';

test('it returns IpAddress on valid data', () => {
    let value: any = "default"

    const { getByRole } = render(<InputIp onChange={v => value = v} />)
    const input = getByRole("textbox")
    expect(input).toBeInTheDocument()
    fireEvent.change(input, { target: { value: "127.0.0.1"} })

    expect(value).toEqual(new IpAddress("127.0.0.1"))
})

test('it returns unknown on invalid data', () => {
    let value: any = "default"

    const { getByRole } = render(<InputIp onChange={v => value = v} />)
    const input = getByRole("textbox")
    expect(input).toBeInTheDocument()
    fireEvent.change(input, { target: { value: "not an ip address"} })

    expect(value).toBe(undefined)
})

test('it updates if default updates', () => {
    const container = document.createElement('div')
    const ip1 = new IpAddress("127.0.0.1")
    const ip2 = new IpAddress("1.2.3.4")

    const { getByRole } = render(<InputIp default={ip1} onChange={() => {}} />, {container})
    const input = getByRole("textbox")
    expect(input.value).toEqual("127.0.0.1")

    fireEvent.change(input, { target: { value: "invalid ip"} })
    expect(input.value).toEqual("invalid ip")

    render(<InputIp default={ip2} onChange={() => {}} />, {container})
    expect(input.value).toEqual("1.2.3.4")
})
