import React from 'react'

type SettingBlockProps = {
    title: string, 
    description?: string, 
    canBeSaved?: boolean,
    isLoading?: boolean
    children?: React.ReactNode,
    onSave?: () => void
}

function Spinner() {
    return (
        <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    )
}

function SettingBlock({title, description, canBeSaved, isLoading, children, onSave}: SettingBlockProps ) {
    const buttonLabel = "Save"
    const handleSubmit = e => {
        e.preventDefault()
        if (onSave) {
            onSave()
        }
    }
    return (
        <div className="page card">
            <h4 className="card-header">{title}</h4>
            <div className="card-body">
                { isLoading === true ? (
                    <Spinner />
                ) : (
                    <form onSubmit={handleSubmit}>
                        { description ? (<p className="text-muted">{description}</p>): ""}
                        {children}
                        { onSave ? (canBeSaved === false ? (
                            <button type="submit" className="btn btn-secondary" disabled title="The form contains errors">{buttonLabel}</button>
                        ) : (
                            <button type="submit" className="btn btn-primary">{buttonLabel}</button>
                        )) : "" }
                    </form>  
                )}
            </div>
        </div>
    )
}

export default SettingBlock
