import React from 'react'
import Spinner from '../Spinner'
import { Button, makeStyles, Tooltip, Typography } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
    text: {
        color: theme.palette.grey[600]
    },
    // disabled buttons have to be wrapped to show a tooltip
    // @see https://github.com/mui-org/material-ui/issues/8416
    tooltipWrapFix: {
        display: "inline-block",
    }
}))

type MixerSettingsWrapperProps = {
    title: string, 
    description?: React.ReactNode, 
    canBeSaved?: boolean,
    isLoading?: boolean
    children?: React.ReactNode,
    onSave?: () => void
}

function MixerSettingsWrapper({title, description, canBeSaved, isLoading, children, onSave}: MixerSettingsWrapperProps ) {
    const classes = useStyles()

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
            { description ? (<Typography paragraph className={classes.text}>{description}</Typography>): ""}
            <form onSubmit={handleSubmit}>
                { children && (<>
                    <Typography variant="h4" paragraph>{title}</Typography>
                    <div>{children}</div>
                </>) }
                { onSave ? (canBeSaved === false ? (
                    <Tooltip title="The form contains errors"><div className={classes.tooltipWrapFix}><Button variant="contained" disabled>{buttonLabel}</Button></div></Tooltip>
                ) : (
                    <Button type="submit" variant="contained" color="primary">{buttonLabel}</Button>
                )) : "" }
            </form>  
        </>)
    }
}

export default MixerSettingsWrapper
