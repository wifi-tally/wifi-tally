import React, { useState } from 'react'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import ValidatingInput from '../../../components/config/ValidatingInput'
import { useAtemConfiguration } from '../../../hooks/useConfiguration'
import { socket } from '../../../hooks/useSocket'

type AtemSettingsProps = {
    id: "atem", // @TODO: use the constant. But for now it makes the frontend build crash with ("Module not found: Can't resolve 'child_process'" - and no stack trace). WTF?
    label: string,
}

function AtemSettings(props: AtemSettingsProps) {
    const configuration = useAtemConfiguration()
    const [ip, setIp] = useState<string|null>(null)
    const [ipValid, setIpValid] = useState(true)
    const [port, setPort] = useState<string|null>(null)
    const [portValid, setPortValid] = useState(true)
    const isLoading = !configuration
    const isValid = ipValid && portValid

    const handleSave = () => {
        if (configuration === undefined) {
            console.error("Not saving, because there is an invalid value in the form.")
        } else if (props.id !== "atem") {
            console.warn(`Changing id prop of AtemSettings is not supported. But got ${props.id}.`)
        } else {
            const config = configuration.clone()
            config.setIp(ip)
            config.setPort(port)

            socket.emit('config.change.atem', config.toJson(), props.id)
        }
    }

    return (
        <MixerSettingsWrapper 
            title="ATEM Configuration"
            description="Connects to any ATEM device over network."
            canBeSaved={isValid}
            isLoading={isLoading}
            onSave={handleSave}
        >
            {configuration && (<>
                <ValidatingInput label="ATEM IP" object={configuration} propertyName="ip" onValid={(newIp) => { setIp(newIp); setIpValid(true) }} onInvalid={() => setIpValid(false)} />
                <ValidatingInput label="ATEM Port" object={configuration} propertyName="port" onValid={(newPort) => { setPort(newPort); setPortValid(true) }} onInvalid={() => setPortValid(false)} />
            </>)}
            
        </MixerSettingsWrapper>
    )
}

AtemSettings.defaultProps = {
    id: "atem",
    label: "ATEM by Blackmagic Design",
}

export default AtemSettings
