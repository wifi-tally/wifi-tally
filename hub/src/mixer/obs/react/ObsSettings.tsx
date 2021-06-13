import React, { useMemo, useState } from 'react'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import ValidatingInput from '../../../components/config/ValidatingInput'
import ExternalLink from '../../../components/ExternalLink'
import { useObsConfiguration } from '../../../hooks/useConfiguration'
import { socket } from '../../../hooks/useSocket'
import { ObsConfigurationLiveMode } from '../ObsConfiguration'
import ObsConnector from '../ObsConnector'
import ObsLiveModeSelect from './ObsLiveModeSelect'

type ObsSettingsProps = {
    id: typeof ObsConnector.ID,
    label: string,
}

function ObsSettings(props: ObsSettingsProps) {
    const configuration = useObsConfiguration()
    const [ip, setIp] = useState<string|null>(null)
    const [ipValid, setIpValid] = useState(true)
    const [port, setPort] = useState<string|null>(null)
    const [portValid, setPortValid] = useState(true)
    const [liveMode, setLiveMode] = useState<ObsConfigurationLiveMode|null>(null)
    const liveModeValid = liveMode !== null
    const isLoading = !configuration
    const isValid = ipValid && portValid && liveModeValid

    useMemo(() => {
        // when default settings change
        if (configuration) {
            setLiveMode(configuration.getLiveMode())
        }
    }, [configuration])

    const handleSave = () => {
        if (configuration === undefined) {
            console.error("Not saving, because there is an invalid value in the form.")
        } else if (props.id !== ObsConnector.ID) {
            console.warn(`Changing id prop of ObsSettings is not supported. But got ${props.id}.`)
        } else {
            const config = configuration.clone()
            config.setIp(ip)
            config.setPort(port)
            config.setLiveMode(liveMode)

            socket.emit('config.change.obs', config.toJson(), props.id)
        }
    }

    return (
        <MixerSettingsWrapper 
            title="OBS Studio Configuration"
            testId="obs"
            description={<>Connects to OBS Studio over network. The <ExternalLink href="https://github.com/Palakis/obs-websocket">obs-websocket plugin version 4.x.x</ExternalLink> has to be installed. Version 5 of the plugin is not yet supported.</>}
            canBeSaved={isValid}
            isLoading={isLoading}
            onSave={handleSave}
        >
            { configuration && (<>
                <ValidatingInput label="Obs IP" testId="obs-ip" object={configuration} propertyName="ip" onValid={(newIp) => { setIp(newIp); setIpValid(true) }} onInvalid={() => setIpValid(false)} />
                <ValidatingInput label="Obs Port" testId="obs-port" object={configuration} propertyName="port" onValid={(newPort) => { setPort(newPort); setPortValid(true) }} onInvalid={() => setPortValid(false)} />
                <ObsLiveModeSelect label="On-Air Status" testId="obs-liveMode" value={liveMode} onChange={setLiveMode} />
            </>)}
        </MixerSettingsWrapper>
    )
}

ObsSettings.defaultProps = {
    id: ObsConnector.ID,
    label: "OBS Studio",
}

export default ObsSettings
