import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import InputPort from './InputPort';
import '@testing-library/jest-dom';
import { IpPort } from '../../domain/IpPort';

test('it returns IpPort on valid data', () => {
    let value: any = "default"

    const { getByRole } = render(<InputPort onChange={v => value = v} />)
    const input = getByRole("textbox")
    expect(input).toBeInTheDocument()
    fireEvent.change(input, { target: { value: "1234"} })

    expect(value).toEqual(new IpPort(1234))
})

test('it returns unknown on invalid data', () => {
    let value: any = "default"

    const { getByRole } = render(<InputPort onChange={v => value = v} />)
    const input = getByRole("textbox")
    expect(input).toBeInTheDocument()
    fireEvent.change(input, { target: { value: "invalid"} })

    expect(value).toBe(undefined)
})

test('it updates if default updates', () => {
    const container = document.createElement('div')
    const port1 = new IpPort(1234)
    const port2 = new IpPort(2345)

    const { getByRole } = render(<InputPort default={port1} onChange={() => {}} />, {container})
    const input = getByRole("textbox")
    expect(input.value).toEqual("1234")

    fireEvent.change(input, { target: { value: "invalid"} })
    expect(input.value).toEqual("invalid")

    render(<InputPort default={port2} onChange={() => {}} />, {container})
    expect(input.value).toEqual("2345")
})
