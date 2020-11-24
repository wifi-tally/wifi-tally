import React from 'react'
import Spinner from '../Spinner'

type MixerSettingsWrapperProps = {
    title: string, 
    description?: React.ReactNode, 
    canBeSaved?: boolean,
    isLoading?: boolean
    children?: React.ReactNode,
    onSave?: () => void
}

function MixerSettingsWrapper({title, description, canBeSaved, isLoading, children, onSave}: MixerSettingsWrapperProps ) {
    const buttonLabel = "Save"
    const handleSubmit = e => {
        e.preventDefault()
        if (onSave) {
            onSave()
        }
    }

    if (isLoading) {
        return (<Spinner />)
    } else {
        return (<>
            { description ? (<p className="text-muted">{description}</p>): ""}
            <form onSubmit={handleSubmit}>
                { children && (<>
                    <legend>{title}</legend>
                    {children}
                </>) }
                { onSave ? (canBeSaved === false ? (
                    <button type="submit" className="btn btn-secondary" disabled title="The form contains errors">{buttonLabel}</button>
                ) : (
                    <button type="submit" className="btn btn-primary">{buttonLabel}</button>
                )) : "" }
            </form>  
        </>)
    }
}

export default MixerSettingsWrapper
