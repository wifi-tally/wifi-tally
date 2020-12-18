import React, { useState } from "react"
import ipPort, { IpPort } from "../../domain/IpPort"
import Input from "./Input"

type InputPortProps = {
    label: string
    default?: IpPort | null
    id?: string
    onChange?: (port: IpPort | null | undefined) => void
}

function validatePort(port?: number|string): IpPort | null | undefined {
    if (!port) { return null }
    try {
        return ipPort(port)
    } catch (e) {
        return undefined
    }
}

function InputPort(props: InputPortProps) {
    const [hasError, setHasError] = useState(validatePort(props.default?.toNumber()) === undefined)

    const handleChange = (value: string) => {
        const port = validatePort(value)
        const isValid = port !== undefined
        setHasError(!isValid)
        if (props.onChange) {
            props.onChange(port)
        }
        return isValid
    }

    return (
        <Input {...props} default={props.default?.toNumber().toString() || ""} onChange={handleChange} errorMessage={hasError ? "Invalid Port number": ""}/>
    )
}

export default InputPort
