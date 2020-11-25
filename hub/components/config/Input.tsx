import React, { useState } from 'react'
import uniqueId from '../uniqueId'

type InputProps = {
    label: string
    default?: string
    errorMessage?: string
    onChange?: (value: string) => boolean
}


function Input(props: InputProps) {
    // @TODO: check with someone who has experience if this is the right way to check for defaults
    const [oldDefault, setOldDefault] = useState(props.default || "")
    const [value, setValue] = useState(props.default || "")
    const [id] = useState(uniqueId())
    const [isValid, setIsValid] = useState(true)

    console.log(props)
    if (props.default !== undefined && props.default !== oldDefault) {
        setOldDefault(props.default)
        setValue(props.default)
        setIsValid(true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setValue(newValue)
        if (props.onChange) {
            const valid = props.onChange(newValue)
            setIsValid(valid)
        }
    }

    return (
        <div className="form-group">
            <label htmlFor={id}>{props.label}</label>
            <input className={"form-control " + (isValid ? "" : "is-invalid")} id={id} type="text" value={value} onChange={handleChange} />
            { !isValid ? (<div className="invalid-feedback">{props.errorMessage || "invalid"}</div>) : "" }
        </div>
    )
}

export default Input
