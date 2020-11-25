import React, { useState } from 'react'
import uniqueId from '../uniqueId'

type NewInputProps = {
    label: string
    value?: string
    isValid: boolean
    testId?: string
    errorMessage?: string
    onChange: (value: string) => void
}

function NewInput(props: NewInputProps) {
    const [id] = useState(uniqueId())

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        props.onChange(newValue)
    }

    return (
        <div className="form-group">
            <label htmlFor={id}>{props.label}</label>
            <input className={"form-control " + (props.isValid ? "" : "is-invalid")} id={id} type="text" value={props.value} onChange={handleChange} data-testid={props.testId} />
            { !props.isValid && props.errorMessage ? (<div className="invalid-feedback">{props.errorMessage}</div>) : "" }
        </div>
    )
}

export default NewInput
