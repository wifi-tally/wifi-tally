import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import Input from './Input';
import '@testing-library/jest-dom';

test('it calls a callback on every key stroke', () => {
    let value: any = null

    const { getByRole } = render(<Input default="Hello World" onChange={v => value = v} />)
    const input = getByRole("textbox")
    expect(input).toBeInTheDocument()
    fireEvent.change(input, { target: { value: "Foobar"} })

    expect(value).toEqual("Foobar")
})

test('it updates if default updates', () => {
    const container = document.createElement('div')

    const { getByRole } = render(<Input default="Hello World" onChange={() => {}} />, {container})
    const input = getByRole("textbox")
    expect(input.value).toEqual("Hello World")

    fireEvent.change(input, { target: { value: "Hello World!"} })
    expect(input.value).toEqual("Hello World!")

    render(<Input default="Foobar" onChange={() => {}} />, {container})
    expect(input.value).toEqual("Foobar")
})
