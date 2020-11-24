import React, { useState } from 'react'
import InputIp from '../../../components/config/InputIp'
import InputPort from '../../../components/config/InputPort'
import SettingBlock from '../../../components/config/SettingBlock'
import { IpAddress } from '../../../domain/IpAddress'
import { IpPort } from '../../../domain/IpPort'
import { useAtemConfiguration } from '../../../hooks/useConfiguration'
import { socket } from '../../../hooks/useSocket'

type AtemSettingsProps = {}

function AtemSettings(props: AtemSettingsProps) {
    const configuration = useAtemConfiguration()
    const [ip, setIp] = useState<IpAddress|null|undefined>(null)
    const [port, setPort] = useState<IpPort|null|undefined>(null)

    const isValid = ip !== undefined && port !== undefined
    const isLoading = configuration === undefined

    const handleSave = () => {
        if (configuration === undefined || ip === undefined || port === undefined) {
            console.error("Not saving, because there is an invalid value in the form.")
        } else {
            const config = configuration.clone()
            config.setIp(ip)
            config.setPort(port)

            socket.emit('config.change.atem', config.toSave())
        }
    }

    return (
        <SettingBlock 
            title="ATEM Configuration"
            description="Connects to any ATEM device over network."
            canBeSaved={isValid}
            isLoading={isLoading}
            onSave={handleSave}
        >
            <InputIp label="ATEM IP" default={configuration?.getIp()} id="atem-ip" onChange={(newIp) => { setIp(newIp) }} />
            <InputPort label="ATEM Port" default={configuration?.getPort()} id="atem-port" onChange={(newPort) => { setPort(newPort) }} />
        </SettingBlock>
    )
}

export default AtemSettings
