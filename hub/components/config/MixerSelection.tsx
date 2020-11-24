import React, { useState } from 'react'
import { useMixerNameConfiguration } from '../../hooks/useConfiguration'
import { socket } from '../../hooks/useSocket'
import Spinner from '../Spinner'
import MixerSettingsWrapper from './MixerSettingsWrapper'

type MixerOptionProps = {
    id: string
    label: string
}

function MixerOption({id, label}: MixerOptionProps) {
    return (
        <option key={id} value={id}>{label}</option>
    )
}

function isValidChild(child: React.ReactElement) {
    return child?.props.id && child?.props.label
}

type MixerSelectionProps = {
    children?: React.ReactElement[],
}

function MixerSelection({children}: MixerSelectionProps) {
    const mixerName = useMixerNameConfiguration()
    const [oldMixerName, setOldMixerName] = useState(mixerName)
    const [mixerId, setMixerId] = useState(mixerName)

    const isLoading = mixerName === undefined
    if (mixerName !== oldMixerName) {
        setMixerId(mixerName)
        setOldMixerName(mixerName)
    }

    const currentMixer = children?.reduce((cur, child) => {
        if (!isValidChild(child)) {
            throw `Expected all nodes of MixerSelection to be ReactNodes implementing SettingProps, but got ${child?.constructor?.name || typeof child}`
        }


        return child.props.id === mixerId ? child : cur
    })

    return (
        <div className="page card">
            <h4 className="card-header">Video Mixer</h4>
            <div className="card-body">
                <p className="text-muted">Select a Video Mixer to use.</p>
                {isLoading ? <Spinner /> : (<>
                    <div className="form-group">
                        <select className="form-control" value={mixerId} onChange={e => setMixerId(e.target.value)}>
                            {children?.map(child => {
                                return (<MixerOption key={child.props.id} id={child.props.id} label={child.props.label} />)
                            })}
                        </select>
                    </div>
                    {currentMixer}
                </>)}
            </div>
        </div>
    )
}

export default MixerSelection
