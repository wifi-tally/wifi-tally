import React, { useState } from 'react'
import InputIp from '../../../components/config/InputIp'
import InputPort from '../../../components/config/InputPort'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import { IpAddress } from '../../../domain/IpAddress'
import { IpPort } from '../../../domain/IpPort'
import { useMockConfiguration } from '../../../hooks/useConfiguration'
import { socket } from '../../../hooks/useSocket'
import MockConnector from '../MockConnector'

type MockSettingsProps = {
    id: typeof MockConnector.ID,
    label: string,
}

function MockSettings(props: MockSettingsProps) {
    const configuration = useMockConfiguration()
    const [tickTime, setTickTime] = useState<number|null|undefined>(null)
    const [channelCount, setChannelCount] = useState<number|null|undefined>(null)
    const [channelNames, setChannelNames] = useState<string|null|undefined>(null)

    const isValid = tickTime !== undefined && channelCount !== undefined && channelNames !== undefined
    const isLoading = configuration === undefined

    const handleSave = () => {
        if (configuration === undefined || tickTime === undefined || channelCount === undefined || channelNames === undefined) {
            console.error("Not saving, because there is an invalid value in the form.")
        } else if (props.id !== MockConnector.ID) {
            console.warn(`Changing id prop of MockSettings is not supported. But got ${props.id}.`)
        } else {
            const config = configuration.clone()
            config.setTickTime(tickTime)
            config.setChannelCount(channelCount)
            config.setChannelNames(channelNames)

            socket.emit('config.change.mock', config.toSave(), props.id)
        }
    }

    return (
        <MixerSettingsWrapper 
            title="Mock Configuration"
            description="
            This simulates a Video Mixer by changing the channels randomly at a fixed time interval.
            It is intended for development, when you do not have a video mixer at hand, but serves
            no purpose in productive environments."
            canBeSaved={isValid}
            isLoading={isLoading}
            onSave={handleSave}
        >
        </MixerSettingsWrapper>
    )
}

MockSettings.defaultProps = {
    id: MockConnector.ID,
    label: "Built-In Mock for testing",
}

export default MockSettings
