import React from 'react'
import Spinner from '../layout/Spinner'
import { Button, makeStyles, Tooltip, Typography } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
    text: {
        color: theme.palette.grey[600]
    },
    // disabled buttons have to be wrapped to show a tooltip
    // @see https://github.com/mui-org/material-ui/issues/8416
    tooltipWrapFix: {
        display: "inline-block",
    },
    footer: {
      borderTop: "solid 1px " + theme.palette.background.default,
      margin: theme.spacing(0, -2),
      padding: theme.spacing(2, 2, 0, 2),
      textAlign: "right",
    }
}))

type MixerSettingsWrapperProps = {
    title: string, 
    testId: string,
    description?: React.ReactNode, 
    canBeSaved?: boolean,
    isLoading?: boolean
    children?: React.ReactNode,
    onSave?: () => void
}

function MixerSettingsWrapper({title, testId, description, canBeSaved, isLoading, children, onSave}: MixerSettingsWrapperProps ) {
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
        return (<div data-testid={testId}>
            { description ? (<Typography paragraph className={classes.text}>{description}</Typography>): ""}
            <form onSubmit={handleSubmit}>
                { children && (<>
                    <Typography variant="h4" paragraph>{title}</Typography>
                    <div>{children}</div>
                </>) }
                <div className={classes.footer}>
                { onSave ? (canBeSaved === false ? (
                    <Tooltip title="The form contains errors"><div className={classes.tooltipWrapFix}><Button data-testid={`${testId}-submit`} variant="contained" disabled>{buttonLabel}</Button></div></Tooltip>
                ) : (
                    <Button data-testid={`${testId}-submit`} type="submit" variant="contained" color="primary">{buttonLabel}</Button>
                )) : "" }
                </div>
            </form>  
        </div>)
    }
}

export default MixerSettingsWrapper
