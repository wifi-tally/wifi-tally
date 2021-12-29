import React, { useState } from 'react'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import ValidatingInput from '../../../components/config/ValidatingInput'
import { useRolandVR50HDConfiguration } from '../../../hooks/useConfiguration'
import { socket } from '../../../hooks/useSocket'

type RolandVR50HDSettingsProps = {
    id: "rolandVR50HD", // @TODO use RolandVR50HD.ID
    label: string,
}

function RolandVR50HDSettings(props: RolandVR50HDSettingsProps) {
    const configuration = useRolandVR50HDConfiguration()
    const [ip, setIp] = useState<string|null>(null)
    const [ipValid, setIpValid] = useState(true)
    const [port, setPort] = useState<string|null>(null)
    const [portValid, setPortValid] = useState(true)
    const isLoading = !configuration
    const isValid = ipValid && portValid

    const handleSave = () => {
        if (configuration === undefined) {
            console.error("Not saving, because there is an invalid value in the form.")
        } else if (props.id !== "rolandVR50HD") {
            console.warn(`Changing id prop of RolandVR50HDSettings is not supported. But got ${props.id}.`)
        } else {
            const config = configuration.clone()
            config.setIp(ip)
            config.setPort(port)

            socket.emit('config.change.rolandVR50HD', config.toJson(), props.id)
        }
    }

    return (
        <MixerSettingsWrapper 
            title="Roland VR-50HD MKII"
            testId="rolandVR50HD"
            description="Roland VR-50HD MKII Mixer connected via LAN."
            canBeSaved={isValid}
            isLoading={isLoading}
            onSave={handleSave}
        >
        { configuration && (<>
            <ValidatingInput label="IP" testId="rolandVR50HD-ip" object={configuration} propertyName="ip" onValid={(newIp) => { setIp(newIp); setIpValid(true) }} onInvalid={() => setIpValid(false)} />
            <ValidatingInput label="Port" testId="rolandVR50HD-port" object={configuration} propertyName="port" onValid={(newPort) => { setPort(newPort); setPortValid(true) }} onInvalid={() => setPortValid(false)} />
        </>)}
        </MixerSettingsWrapper>
    )
}

RolandVR50HDSettings.defaultProps = {
    id: "rolandVR50HD",
    label: "Roland VR-50HD MKII",
}

export default RolandVR50HDSettings
