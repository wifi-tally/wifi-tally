import React, { useState } from 'react'
import Layout from '../components/layout/Layout'
import AtemSettings from '../mixer/atem/react/AtemSettings'
import MixerSelection from '../components/config/MixerSelection'
import NullSettings from '../mixer/null/react/NullSettings'
import MockSettings from '../mixer/mock/react/MockSettings'
import ObsSettings from '../mixer/obs/react/ObsSettings'
import VmixSettings from '../mixer/vmix/react/VmixSettings'

const ConfigPage = () => {
  return (
    <Layout>
      <MixerSelection>
        <NullSettings />
        <AtemSettings />
        <MockSettings />
        <ObsSettings />
        <VmixSettings />
      </MixerSelection>
    </Layout>
  )
}
export default ConfigPage;