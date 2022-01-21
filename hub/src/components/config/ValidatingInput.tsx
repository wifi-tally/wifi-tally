import { makeStyles, TextField } from '@material-ui/core'
import React, { useState } from 'react'
import { Configuration } from '../../mixer/interfaces'

type ValidatingInputProps = {
    label: string
    testId: string
    object: Configuration
    propertyName: string
    errorMessage?: string
    warningMessage?: string
    onValid?: (value: string|null) => void
    onInvalid?: () => void
}

const useStyles = makeStyles(theme => ({
    input: {
        margin: theme.spacing(0, 2, 2, 0)
    }
}))


const upperCaseFirst = (value: string) => `${value.substr(0, 1).toUpperCase()}${value.substr(1)}`

/* an active component that allows easy editing of values of Configuration objects
 * 
 * It validates values by trying to call the setter on the object. If it does not throw an error
 * the value is assumed to be valid.
 */
function ValidatingInput({label, testId, object, propertyName, errorMessage, warningMessage, onValid, onInvalid}: ValidatingInputProps) {
    const getterName = `get${upperCaseFirst(propertyName)}`
    const setterName = `set${upperCaseFirst(propertyName)}`
    if (typeof object[getterName] !== "function") { throw new Error(`${getterName} is not a function`) }
    if (typeof object[setterName] !== "function") { throw new Error(`${setterName} is not a function`) }

    const theObjectValue = object[getterName]().toString()
    const [oldValue, setOldValue] = useState<string|null>(null)
    const [value, setValue] = useState<string|null>(null)
    const [isValid, setIsValid] = useState(true)
    const classes = useStyles()

    if (theObjectValue !== oldValue) {
        // value in the default object was changed
        setOldValue(theObjectValue)
        setValue(theObjectValue)
        setIsValid(true)
        // we can not render a parent synchrounously
        onValid && setTimeout(() => onValid(theObjectValue), 1)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value === "" ? null : e.target.value
        setValue(newValue)
        try {
            object.clone()[setterName](newValue)
            setIsValid(true)
            onValid && onValid(newValue)
        } catch (e) {
            setIsValid(false)
            onInvalid && onInvalid()
        }
    }

    return (
        <TextField
            data-testid={testId}
            label={label} 
            value={value} 
            onChange={handleChange}
            error={!isValid}
            helperText={!isValid ? (errorMessage || "invalid") : (warningMessage || "")}
            className={classes.input}
        />
    )
}

export default ValidatingInput
