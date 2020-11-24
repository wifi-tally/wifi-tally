import React, { useState } from 'react'
import SettingBlock from './SettingBlock'

type MixerOptionProps = {
    id: string
    label: string
}

const mixerLabels = {
    mock: "Built-In Mock for testing",
    atem: "ATEM by Blackmagic Design",
    obs: "OBS Studio",
    vmix: "vMix",
    "null": "Off",
}

function MixerOption({id, label}: MixerOptionProps) {
    return (
        <option key={id} value={id}>{label}</option>
    )
}

type MixerSelectionProps = {
    mixerId?: string
}

function MixerSelection(props: MixerSelectionProps) {
    const [mixerId, setMixerId] = useState(props.mixerId)

    return (
        <SettingBlock 
            title="Video Mixer"
            description="Select a Video Mixer to use."
        >
            <div className="form-group">
                <select className="form-control" value={mixerId} onChange={e => setMixerId(e.target.value)}>
                    <MixerOption id="null" label="Off" />
                    <MixerOption id="mock" label="Built-In Mock for testing" />
                    <MixerOption id="atem" label="ATEM by Blackmagic Design" />
                    <MixerOption id="obs" label="OBS Studio" />
                    <MixerOption id="vmix" label="vMix" />
                </select>
          </div>
        </SettingBlock>
    )

}

export default MixerSelection
