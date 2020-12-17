import React, { useState } from 'react'
import Input from '../../../components/config/Input'
import InputIp from '../../../components/config/InputIp'
import InputPort from '../../../components/config/InputPort'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import { IpAddress } from '../../../domain/IpAddress'
import { IpPort } from '../../../domain/IpPort'
import { useAtemConfiguration } from '../../../hooks/useConfiguration'
import { socket } from '../../../hooks/useSocket'

type AtemSettingsProps = {
    id: "atem", // @TODO: use the constant. But for now it makes the frontend build crash with ("Module not found: Can't resolve 'child_process'" - and no stack trace). WTF?
    label: string,
}

function AtemSettings(props: AtemSettingsProps) {
    const configuration = useAtemConfiguration()
    const [ip, setIp] = useState<IpAddress|null|undefined>(null)
    const [port, setPort] = useState<IpPort|null|undefined>(null)

    const isValid = ip !== undefined && port !== undefined
    const isLoading = configuration === undefined

    const handleSave = () => {
        if (configuration === undefined || ip === undefined || port === undefined) {
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
            <InputIp label="ATEM IP" default={configuration?.getIp()} onChange={(newIp) => { setIp(newIp) }} />
            <InputPort label="ATEM Port" default={configuration?.getPort()} onChange={(newPort) => { setPort(newPort) }} />
        </MixerSettingsWrapper>
    )
}

AtemSettings.defaultProps = {
    id: "atem",
    label: "ATEM by Blackmagic Design",
}

export default AtemSettings
