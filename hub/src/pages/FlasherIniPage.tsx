import { Button, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react'
import EditSettingsIni from '../components/EditSettingsIni';
import Layout from '../components/layout/Layout'
import MiniPage from '../components/layout/MiniPage';
import Spinner from '../components/layout/Spinner';
import TallyDevice, { TallyDeviceObjectType } from '../flasher/TallyDevice';
import TallySettingsIni from '../flasher/TallySettingsIni';
import { socket } from '../hooks/useSocket';

function useTallyDevice(i: number) {
  const [tallyDevice, setTallyDevice] = useState<TallyDevice>(undefined)

  useEffect(() => {
    const onFlasherDevice = (device: TallyDeviceObjectType) => {
      setTallyDevice(TallyDevice.fromJson(device))
    }
    socket.on('flasher.device', onFlasherDevice)

    setTallyDevice(undefined)
    socket.emit('flasher.device.get')
    return () => {
      socket.off('flasher.device', onFlasherDevice)
    }
  }, [i])

  return tallyDevice
}

type FlasherIniContentProps = {
  tallyDevice: TallyDevice
}

const FlasherIniContent = ({tallyDevice}: FlasherIniContentProps) => {
  const handleSave = (tallySettings: TallySettingsIni) => {
    console.log(tallySettings)
  }
  if(tallyDevice === undefined) {
    return <Spinner />
  } else if (tallyDevice.path === undefined) {
    return <Typography paragraph>Nothing connected</Typography>
  } else if (tallyDevice.nodeMcuVersion === undefined) {
    return <Typography paragraph>Is LUA there? Firmware flashed?</Typography>
  } else if (!tallyDevice.tallySettings) {
    return <Typography paragraph>tally-settings.ini not there</Typography>
  } else {
    return <EditSettingsIni settingsIni={tallyDevice.tallySettings} onSave={handleSave} />
  }
}

const FlasherIniPage = () => {
  // every increment will refresh tallyDevice
  const [increment, setIncrement] = useState<number>(1)
  const tallyDevice = useTallyDevice(increment)
  const isLoading = tallyDevice === undefined

  const handleReload = () => {
    setIncrement(increment + 1)
  }

  return (
    <Layout testId="flasher-ini">
      <MiniPage title="Flasher">
        <Button disabled={isLoading} onClick={handleReload}>Reload</Button>
        <FlasherIniContent tallyDevice={tallyDevice} />
      </MiniPage>
    </Layout>
  )
}
export default FlasherIniPage;