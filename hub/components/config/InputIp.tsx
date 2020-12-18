import React, { useState } from "react"
import ipAddress, { IpAddress } from "../../domain/IpAddress"
import Input from "./Input"

type InputIpProps = {
    label: string
    default?: IpAddress | null
    id?: string
    onChange?: (ip: IpAddress | null | undefined) => void
}

function validateIp(ip?: string): IpAddress | null | undefined {
    if (!ip) { return null }
    try {
        return ipAddress(ip)
    } catch (e) {
        return undefined
    }
}

function InputIp(props: InputIpProps) {
    const [hasError, setHasError] = useState(validateIp(props.default?.toString()) === undefined)

    const handleChange = (value: string) => {
        const ip = validateIp(value)
        const isValid = ip !== undefined
        setHasError(!isValid)
        if (props.onChange) {
            props.onChange(ip)
        }
        return isValid
    }

    return (
        <Input {...props} default={props.default?.toString() || ""} onChange={handleChange} errorMessage={hasError ? "Invalid IP format": ""}/>
    )
}

export default InputIp
