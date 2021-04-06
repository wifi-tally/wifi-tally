import React, { useState } from 'react'
import Layout from '../components/layout/Layout'
import AtemSettings from '../mixer/atem/react/AtemSettings'
import MixerSelection from '../components/config/MixerSelection'
import NullSettings from '../mixer/null/react/NullSettings'
import MockSettings from '../mixer/mock/react/MockSettings'
import ObsSettings from '../mixer/obs/react/ObsSettings'
import RolandV8HDSettings from '../mixer/rolandV8HD/react/RolandV8HDSettings'
import TestSettings from '../mixer/test/react/TestSettings'
import VmixSettings from '../mixer/vmix/react/VmixSettings'
import TallySettings from '../components/config/TallySettings'

const ConfigPage = () => {
  return (
    <Layout testId="config">
      <MixerSelection>
        <NullSettings />
        <AtemSettings />
        <MockSettings />
        <ObsSettings />
        <RolandV8HDSettings />
        <TestSettings />
        <VmixSettings />
      </MixerSelection>
      <TallySettings />
    </Layout>
  )
}
export default ConfigPage;