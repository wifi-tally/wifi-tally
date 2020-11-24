import React, { useState } from 'react'
import uniqueId from '../uniqueId'

type InputProps = {
    label: string
    default?: string
    errorMessage?: string
    onChange?: (value: string) => void
}

function Input(props: InputProps) {
    // @TODO: check with someone who has experience if this is the right way to check for defaults
    const [oldDefault, setOldDefault] = useState(props.default || "")
    const [value, setValue] = useState(props.default || "")
    const [id] = useState(uniqueId())

    if (props.default !== undefined && props.default !== oldDefault) {
        setValue(props.default)
        setOldDefault(props.default)
    }

    const isValid = !props.errorMessage

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setValue(newValue)
        if (props.onChange) {
            props.onChange(newValue)
        }
    }

    return (
        <div className="form-group">
            <label htmlFor={id}>{props.label}</label>
            <input className={"form-control " + (isValid ? "" : "is-invalid")} id={id} type="text" value={value} onChange={handleChange} />
            { props.errorMessage ? (<div className="invalid-feedback">{props.errorMessage}</div>) : "" }
        </div>
    )
}

export default Input
