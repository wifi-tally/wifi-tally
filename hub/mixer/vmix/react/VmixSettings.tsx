import React, { useState } from 'react'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import ValidatingInput from '../../../components/config/ValidatingInput'
import { useVmixConfiguration } from '../../../hooks/useConfiguration'
import { socket } from '../../../hooks/useSocket'

type VmixSettingsProps = {
    id: "vmix", // @TODO use Vmix.ID
    label: string,
}

function VmixSettings(props: VmixSettingsProps) {
    const configuration = useVmixConfiguration()
    const [ip, setIp] = useState<string|null>(null)
    const [ipValid, setIpValid] = useState(true)
    const [port, setPort] = useState<string|null>(null)
    const [portValid, setPortValid] = useState(true)
    const isLoading = !configuration
    const isValid = ipValid && portValid

    const handleSave = () => {
        if (configuration === undefined) {
            console.error("Not saving, because there is an invalid value in the form.")
        } else if (props.id !== "vmix") {
            console.warn(`Changing id prop of VmixSettings is not supported. But got ${props.id}.`)
        } else {
            const config = configuration.clone()
            config.setIp(ip)
            config.setPort(port)

            socket.emit('config.change.vmix', config.toJson(), props.id)
        }
    }

    return (
        <MixerSettingsWrapper 
            title="vMix"
            description="Connects to any vMix over network."
            canBeSaved={isValid}
            isLoading={isLoading}
            onSave={handleSave}
        >
        { configuration && (<>
            <ValidatingInput label="vMix IP" object={configuration} propertyName="ip" onValid={(newIp) => { setIp(newIp); setIpValid(true) }} onInvalid={() => setIpValid(false)} />
            <ValidatingInput label="vMix Port" object={configuration} propertyName="port" onValid={(newPort) => { setPort(newPort); setPortValid(true) }} onInvalid={() => setPortValid(false)} />
        </>)}
        </MixerSettingsWrapper>
    )
}

VmixSettings.defaultProps = {
    id: "vmix",
    label: "vMix",
}

export default VmixSettings
