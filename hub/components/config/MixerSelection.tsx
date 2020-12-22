import { makeStyles, NativeSelect, Typography } from '@material-ui/core'
import React, { useState } from 'react'
import { useMixerNameConfiguration } from '../../hooks/useConfiguration'
import Spinner from '../Spinner'
import MiniPage from '../style/MiniPage'

const useStyles = makeStyles(theme => ({
    text: {
        color: theme.palette.grey[600]
    },
    select: {
        marginBottom: theme.spacing(2),
    },
}))

type MixerOptionProps = {
    id: string
    label: string
}

function MixerOption({id, label}: MixerOptionProps) {
    return (
        <option key={id} value={id}>{label}</option>
    )
}

function isValidChild(child: React.ReactElement) {
    return child?.props.id && child?.props.label
}

type MixerSelectionProps = {
    children?: React.ReactElement[],
}

function MixerSelection({children}: MixerSelectionProps) {
    const mixerName = useMixerNameConfiguration()
    const [oldMixerName, setOldMixerName] = useState(mixerName)
    const [mixerId, setMixerId] = useState(mixerName)
    const classes = useStyles()

    const isLoading = mixerName === undefined
    if (mixerName !== oldMixerName) {
        setMixerId(mixerName)
        setOldMixerName(mixerName)
    }

    const currentMixer = children?.reduce((cur, child) => {
        if (!isValidChild(child)) {
            throw `Expected all nodes of MixerSelection to be ReactNodes implementing SettingProps, but got ${child?.constructor?.name || typeof child}`
        }


        return child.props.id === mixerId ? child : cur
    })

    return (
        <MiniPage title="Video Mixer">
            <Typography paragraph className={classes.text}>Select a Video Mixer to use.</Typography>
            {isLoading ? <Spinner /> : (<>
                <div className={classes.select}>
                    <NativeSelect value={mixerId} onChange={e => setMixerId(e.target.value)}>
                        {children?.map(child => {
                            return (<MixerOption key={child.props.id} id={child.props.id} label={child.props.label} />)
                        })}
                    </NativeSelect>
                </div>
                {currentMixer}
            </>)}
        </MiniPage>
    )
}

export default MixerSelection
