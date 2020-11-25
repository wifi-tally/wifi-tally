import React, { useState } from 'react'
import Input from '../../../components/config/Input'
import InputIp from '../../../components/config/InputIp'
import InputPort from '../../../components/config/InputPort'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import NewInput from '../../../components/config/NewInput'
import { IpAddress } from '../../../domain/IpAddress'
import { IpPort } from '../../../domain/IpPort'
import { useMockConfiguration } from '../../../hooks/useConfiguration'
import { socket } from '../../../hooks/useSocket'
import MockConnector from '../MockConnector'

type MockSettingsProps = {
    id: typeof MockConnector.ID,
    label: string,
}


function myUseState(validator: (value: string|null) => void, initialState: string|null) : [string|null, boolean, React.Dispatch<React.SetStateAction<string|null|undefined>>] {
    const isItValid = (value: string|null) => {
        try {
            validator(value)
            return true
        } catch {
            setter(null)
            return false
        }
    }

    const [value, setter] = useState<string|null>(initialState)
    const [isValid, setIsValid] = useState<boolean>(isItValid(initialState))

    const mySetter = (value: string|null) => {
        setter(value)
        setIsValid(isItValid(value))
    }

    return [value, isValid, mySetter]
}

function MockSettings(props: MockSettingsProps) {
    const config = useMockConfiguration()
    const [oldConfig, setOldConfig] = useState(config)
    const [tickTime, setTickTime] = useState(config?.getTickTime().toString())
    const [channelCount, setChannelCount] = useState(config?.getChannelCount().toString())
    const [channelNames, setChannelNames] = useState(config?.getChannels().filter(c => c.name).map(c => c.name).join(", "))

    const isTickTimeValid = (() => {
        if (tickTime === undefined || !config) { return false }
        try {
            config.clone().setTickTime(tickTime)
            return true
        } catch {
            return false
        }
    })()

    const isChannelCountValid = (() => {
        if (channelCount === undefined || !config) { return false }
        try {
            config.clone().setChannelCount(channelCount)
            return true
        } catch {
            return false
        }
    })()

    const areChannelNamesValid = (() => {
        if (channelNames === undefined || !config) { return false }
        try {
            config.clone().setChannelNames(channelNames)
            return true
        } catch {
            return false
        }
    })()
    
    // @TODO: better compare objects
    if (JSON.stringify(config?.toSave()) !== JSON.stringify(oldConfig?.toSave())) {
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
            <NewInput label="Tick Time" value={tickTime} onChange={val => setTickTime(val)} isValid={isTickTimeValid} />
            <NewInput label="Channel Count" value={channelCount} onChange={val => setChannelCount(val)} isValid={isChannelCountValid} />
            <NewInput label="Channel Names" value={channelNames} onChange={val => setChannelNames(val)} isValid={areChannelNamesValid} />
        </MixerSettingsWrapper>
    )
}

MockSettings.defaultProps = {
    id: MockConnector.ID,
    label: "Built-In Mock for testing",
}

export default MockSettings
