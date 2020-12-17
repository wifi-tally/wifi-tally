import React, { useState } from 'react'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import NewInput from '../../../components/config/NewInput'
import { useMockConfiguration } from '../../../hooks/useConfiguration'
import { socket } from '../../../hooks/useSocket'
import MockConnector from '../MockConnector'

type MockSettingsProps = {
    id: typeof MockConnector.ID,
    label: string,
}

function useStatefulValidation(defaultValue, validator) {
    const [tickTime, setTickTime] = useState(defaultValue)

    const isTickTimeValid = (() => {
        if (tickTime === undefined) { return false }
        try {
            return validator(tickTime) !== undefined
        } catch {
            return false
        }
    })()

    return [tickTime, isTickTimeValid, setTickTime]
}

function MockSettings(props: MockSettingsProps) {
    const config = useMockConfiguration()
    const [oldConfig, setOldConfig] = useState(config)
    const [tickTime, isTickTimeValid, setTickTime] = useStatefulValidation(
        config?.getTickTime().toString(),
        val => config?.clone().setTickTime(val)
    )
    const [channelCount, isChannelCountValid, setChannelCount] = useStatefulValidation(
        config?.getChannelCount().toString(),
        val => config?.clone().setChannelCount(val)
    )
    const [channelNames, areChannelNamesValid, setChannelNames] = useStatefulValidation(
        config?.getChannels().filter(c => c.name).map(c => c.name).join(", "),
        val => config?.clone().setChannelNames(val)
    )
    
    // @TODO: better compare objects
    if (JSON.stringify(config?.toJson()) !== JSON.stringify(oldConfig?.toJson())) {
        setOldConfig(config)
        setTickTime(config?.getTickTime().toString())
        setChannelCount(config?.getChannelCount().toString())
        setChannelNames(config?.getChannels().filter(c => c.name).map(c => c.name).join(", "))
    }

    const isValid = isTickTimeValid && isChannelCountValid && areChannelNamesValid
    const isLoading = config === undefined

    const handleSave = () => {
        if (!config) { return }
        const newConfig = config.clone()
        tickTime && newConfig.setTickTime(tickTime)
        channelCount && newConfig.setChannelCount(channelCount)
        channelNames && newConfig.setChannelNames(channelNames)

        socket.emit('config.change.mock', newConfig, MockConnector.ID)
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
            <NewInput label="Tick Time" testId="tick-time" value={tickTime} onChange={val => setTickTime(val)} isValid={isTickTimeValid} />
            <NewInput label="Channel Count" testId="channel-count" value={channelCount} onChange={val => setChannelCount(val)} isValid={isChannelCountValid} />
            <NewInput label="Channel Names" testId="channel-names" value={channelNames} onChange={val => setChannelNames(val)} isValid={areChannelNamesValid} />
        </MixerSettingsWrapper>
    )
}

MockSettings.defaultProps = {
    id: MockConnector.ID,
    label: "Built-In Mock for testing",
}

export default MockSettings
