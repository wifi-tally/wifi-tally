import React, { useState } from 'react'
import InputIp from '../../../components/config/InputIp'
import InputPort from '../../../components/config/InputPort'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import { IpAddress } from '../../../domain/IpAddress'
import { IpPort } from '../../../domain/IpPort'
import { useVmixConfiguration } from '../../../hooks/useConfiguration'
import { socket } from '../../../hooks/useSocket'

type VmixSettingsProps = {
    id: "vmix", // @TODO use Vmix.ID
    label: string,
}

function VmixSettings(props: VmixSettingsProps) {
    const configuration = useVmixConfiguration()
    const [ip, setIp] = useState<IpAddress|null|undefined>(null)
    const [port, setPort] = useState<IpPort|null|undefined>(null)

    const isValid = ip !== undefined && port !== undefined
    const isLoading = configuration === undefined

    const handleSave = () => {
        if (configuration === undefined || ip === undefined || port === undefined) {
            console.error("Not saving, because there is an invalid value in the form.")
        } else if (props.id !== "vmix") {
            console.warn(`Changing id prop of VmixSettings is not supported. But got ${props.id}.`)
        } else {
            const config = configuration.clone()
            config.setIp(ip)
            config.setPort(port)

            socket.emit('config.change.vmix', config.toSave(), props.id)
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
            <InputIp label="vMix IP" default={configuration?.getIp()} onChange={(newIp) => { setIp(newIp) }} />
            <InputPort label="vMix Port" default={configuration?.getPort()} onChange={(newPort) => { setPort(newPort) }} />
        </MixerSettingsWrapper>
    )
}

VmixSettings.defaultProps = {
    id: "vmix",
    label: "vMix",
}

export default VmixSettings
