import React, { useState } from 'react'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import ValidatingInput from '../../../components/config/ValidatingInput'
import { socket } from '../../../hooks/useSocket'
import { useRolandV8HDConfiguration } from '../../../hooks/useConfiguration'

type RolandV8HDSettingsProps = {
    id: "rolandV8HD",
    label: string,
}

function RolandV8HDSettings(props: RolandV8HDSettingsProps) {
    const configuration = useRolandV8HDConfiguration()
    const [requestInterval, setRequestInterval] = useState<string|number|null>(null)
    const [requestIntervalValid, setRequestIntervalValid] = useState(true)
    const isLoading = !configuration
    const isValid = requestIntervalValid

    const handleSave = () => {
        if (configuration === undefined) {
            console.error("Not saving, because there is an invalid value in the form.")
        } else if (props.id !== "rolandV8HD") {
            console.warn(`Changing id prop of RolandV8HDSettings is not supported. But got ${props.id}.`)
        } else {
            const config = configuration.clone()
            config.setRequestInterval(requestInterval)
            socket.emit('config.change.rolandV8HD', config.toJson(), props.id)
        }
    }

    return (
        <MixerSettingsWrapper
            title="Roland V-8HD"
            testId="rolandV8HD"
            description="Roland V-8HD Mixer connected via USB-Midi"
            canBeSaved={isValid}
            isLoading={isLoading}
            onSave={handleSave}
        >
        { configuration && (<>
            <ValidatingInput label="Request Interval" testId="rolandV8HD-request-interval" object={configuration} propertyName="requestInterval" onValid={(newRequestInterval) => { setRequestInterval(newRequestInterval); setRequestIntervalValid(true) }} onInvalid={() => setRequestIntervalValid(false)} />
            </>)}
        </MixerSettingsWrapper>
    )
}

RolandV8HDSettings.defaultProps = {
    id: "rolandV8HD",
    label: "Roland V-8HD",
}

export default RolandV8HDSettings
