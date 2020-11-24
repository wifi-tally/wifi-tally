import React, { useState } from 'react'
import InputIp from '../../../components/config/InputIp'
import InputPort from '../../../components/config/InputPort'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import { IpAddress } from '../../../domain/IpAddress'
import { IpPort } from '../../../domain/IpPort'
import { useObsConfiguration } from '../../../hooks/useConfiguration'
import { socket } from '../../../hooks/useSocket'
import ObsConnector from '../ObsConnector'

type ObsSettingsProps = {
    id: typeof ObsConnector.ID,
    label: string,
}

function ObsSettings(props: ObsSettingsProps) {
    const configuration = useObsConfiguration()
    const [ip, setIp] = useState<IpAddress|null|undefined>(null)
    const [port, setPort] = useState<IpPort|null|undefined>(null)

    const isValid = ip !== undefined && port !== undefined
    const isLoading = configuration === undefined

    const handleSave = () => {
        if (configuration === undefined || ip === undefined || port === undefined) {
            console.error("Not saving, because there is an invalid value in the form.")
        } else if (props.id !== ObsConnector.ID) {
            console.warn(`Changing id prop of ObsSettings is not supported. But got ${props.id}.`)
        } else {
            const config = configuration.clone()
            config.setIp(ip)
            config.setPort(port)

            socket.emit('config.change.obs', config.toSave(), props.id)
        }
    }

    return (
        <MixerSettingsWrapper 
            title="OBS Studio Configuration"
            description={<>Connects to OBS Studio over network. The <a href="https://github.com/Palakis/obs-websocket" target="_blank">obs-websocket plugin</a> has to be installed.</>}
            canBeSaved={isValid}
            isLoading={isLoading}
            onSave={handleSave}
        >
            <InputIp label="OBS IP" default={configuration?.getIp()} onChange={(newIp) => { setIp(newIp) }} />
            <InputPort label="OBS Port" default={configuration?.getPort()} onChange={(newPort) => { setPort(newPort) }} />
        </MixerSettingsWrapper>
    )
}

ObsSettings.defaultProps = {
    id: ObsConnector.ID,
    label: "OBS Studio",
}

export default ObsSettings
