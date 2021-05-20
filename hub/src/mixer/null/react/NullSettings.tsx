import React from 'react'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import { socket } from '../../../hooks/useSocket'
import { SettingsProps } from '../../interfaces'
import NullConnector from '../NullConnector'

type NullSettingsProps = SettingsProps & {}

function NullSettings(props: NullSettingsProps) {
    const handleSave = () => {
        if (props.id !== NullConnector.ID) {
            console.warn(`Changing id prop of NullSettings is not supported. But got ${props.id}.`)
        } else {
            socket.emit('config.change.null', NullConnector.ID)
        }
    }

    return (<MixerSettingsWrapper 
        title="Null Configuration"
        testId="null"
        description="Off"
        onSave={handleSave}
    ></MixerSettingsWrapper>)
}

NullSettings.defaultProps = {
    id: NullConnector.ID,
    label: "Off"
}

export default NullSettings
