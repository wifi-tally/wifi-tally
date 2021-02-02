import React, { useMemo, useState } from 'react'
import MixerSettingsWrapper from '../../../components/config/MixerSettingsWrapper'
import ValidatingInput from '../../../components/config/ValidatingInput'
import ExternalLink from '../../../components/ExternalLink'
import { useWirecastConfiguration } from '../../../hooks/useConfiguration'
import { socket } from '../../../hooks/useSocket'
import { WirecastConfigurationLiveMode } from '../WirecastConfiguration'
import WirecastConnector from '../WirecastConnector'
import WirecastLayerSelect from './WirecastLayerSelect'
import WirecastLiveModeSelect from './WirecastLiveModeSelect'

type WirecastSettingsProps = {
    id: typeof WirecastConnector.ID,
    label: string,
}

function WirecastSettings(props: WirecastSettingsProps) {
    const configuration = useWirecastConfiguration()
    const [ip, setIp] = useState<string|null>(null)
    const [ipValid, setIpValid] = useState(true)
    const [port, setPort] = useState<string|null>(null)
    const [portValid, setPortValid] = useState(true)
    const [liveMode, setLiveMode] = useState<WirecastConfigurationLiveMode|null>(null)
    const liveModeValid = liveMode !== null
    const [layers, setLayers] = useState<number[]|null>(null)
    const isLayersValid = layers === null || layers.length > 0
    const isLoading = !configuration
    const isValid = ipValid && portValid && liveModeValid && isLayersValid

    useMemo(() => {
        // when default settings change
        if (configuration) {
            setLiveMode(configuration.getLiveMode())
            setLayers(configuration.getLayers())
        }
    }, [configuration])

    const handleSave = () => {
        if (configuration === undefined) {
            console.error("Not saving, because there is an invalid value in the form.")
        } else if (props.id !== WirecastConnector.ID) {
            console.warn(`Changing id prop of WirecastSettings is not supported. But got ${props.id}.`)
        } else {
            const config = configuration.clone()
            config.setIp(ip)
            config.setPort(port)
            config.setLiveMode(liveMode)
            config.setLayers(layers)

            socket.emit('config.change.wirecast', config.toJson(), props.id)
        }
    }

    return (
        <MixerSettingsWrapper 
            title="Telestream Wirecast Configuration"
            testId="wirecast"
            description={<>Experimental support. Install <ExternalLink href="https://github.com/wifi-tally/wirecast-tally-bridge-win">wirecast-tally-bridge</ExternalLink> on the same Windows PC that runs Wirecast (no support for Mac at the moment. Sorry.)</>}
            canBeSaved={isValid}
            isLoading={isLoading}
            onSave={handleSave}
        >
            { configuration && (<>
                <ValidatingInput label="Wirecast IP" testId="wc-ip" object={configuration} propertyName="ip" onValid={(newIp) => { setIp(newIp); setIpValid(true) }} onInvalid={() => setIpValid(false)} />
                <ValidatingInput label="Wirecast Port" testId="wc-port" object={configuration} propertyName="port" onValid={(newPort) => { setPort(newPort); setPortValid(true) }} onInvalid={() => setPortValid(false)} />
                <WirecastLiveModeSelect label="On-Air Status" testId="wc-liveMode" value={liveMode} onChange={setLiveMode} />
                <WirecastLayerSelect label="Limit Layers" testId="wc-layers" value={layers} onChange={setLayers} errorText={isLayersValid ? null : "Please select at least one layer."} />
            </>)}
        </MixerSettingsWrapper>
    )
}

WirecastSettings.defaultProps = {
    id: WirecastConnector.ID,
    label: "Wirecast by Telestream",
}

export default WirecastSettings
