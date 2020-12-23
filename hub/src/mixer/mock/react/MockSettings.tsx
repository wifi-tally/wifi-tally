import React, { useState } from 'react'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import ValidatingInput from '../../../components/config/ValidatingInput'
import { useMockConfiguration } from '../../../hooks/useConfiguration'
import { socket } from '../../../hooks/useSocket'
import MockConnector from '../MockConnector'

type MockSettingsProps = {
    id: typeof MockConnector.ID,
    label: string,
}

function MockSettings(props: MockSettingsProps) {
    const configuration = useMockConfiguration()
    const [tickTime, setTickTime] = useState<string|null>(null)
    const [tickTimeValid, setTickTimeValid] = useState(true)
    const [channelCount, setChannelCount] = useState<string|null>(null)
    const [channelCountValid, setChannelCountValid] = useState(true)
    const [channelNames, setChannelNames] = useState<string|null>(null)
    const [channelNamesValid, setChannelNamesValid] = useState(true)
    const isLoading = !configuration
    const isValid = tickTimeValid && channelCountValid && channelNamesValid
    
    const handleSave = () => {
        if (configuration === undefined) {
            console.error("Not saving, because there is an invalid value in the form.")
        } else if (props.id !== MockConnector.ID) {
            console.warn(`Changing id prop of MockSettings is not supported. But got ${props.id}.`)
        } else {
            const config = configuration.clone()
            config.setTickTime(tickTime)
            config.setChannelCount(channelCount)
            config.setChannelNames(channelNames)

            socket.emit('config.change.mock', config.toJson(), MockConnector.ID)
        }
    }

    return (
        <MixerSettingsWrapper 
            title="Mock Configuration"
            testId="mock"
            description="
            This simulates a Video Mixer by changing the channels randomly at a fixed time interval.
            It is intended for development, when you do not have a video mixer at hand, but serves
            no purpose in productive environments."
            canBeSaved={isValid}
            isLoading={isLoading}
            onSave={handleSave}
        >{configuration && (<>
            <ValidatingInput label="Tick Time" testId="mock-tick" object={configuration} propertyName="tickTime" onValid={(tickTime) => { setTickTime(tickTime); setTickTimeValid(true) }} onInvalid={() => setTickTimeValid(false)} />
            <ValidatingInput label="Channel Count" testId="mock-channelCount" object={configuration} propertyName="channelCount" onValid={(channelCount) => { setChannelCount(channelCount); setChannelCountValid(true) }} onInvalid={() => setChannelCountValid(false)} />
            <ValidatingInput label="Channel Names" testId="mock-channelNames" object={configuration} propertyName="channelNames" onValid={(channelNames) => { setChannelNames(channelNames); setChannelNamesValid(true) }} onInvalid={() => setChannelNamesValid(false)} />
        </>)}</MixerSettingsWrapper>
    )
}

MockSettings.defaultProps = {
    id: MockConnector.ID,
    label: "Built-In Mock for testing",
}

export default MockSettings
