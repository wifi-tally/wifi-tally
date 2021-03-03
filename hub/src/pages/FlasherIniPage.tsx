import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, makeStyles } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import React, { useEffect, useState } from 'react'
import EditSettingsIni from '../components/EditSettingsIni';
import ExternalLink from '../components/ExternalLink';
import Layout from '../components/layout/Layout'
import MiniPage from '../components/layout/MiniPage';
import Spinner from '../components/layout/Spinner';
import TallySettingsIniProgress from '../components/TallySettingsProgress';
import { TallySettingsIniProgressType } from '../flasher/NodeMcuConnector';
import TallyDevice, { TallyDeviceObjectType } from '../flasher/TallyDevice';
import TallySettingsIni from '../flasher/TallySettingsIni';
import RefreshIcon from '@material-ui/icons/Refresh';
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
  disabled: boolean
  handleReload: () => void
  handleSave: (t: TallySettingsIni) => void
}

const useStyles = makeStyles(theme => {
  return {
    warning: {
      marginBottom: theme.spacing(2),
    },
    info: {
      marginBottom: theme.spacing(2),
      "& a": {
        color: theme.palette.info.main,
      }
    }
  }
})

const FlasherIniContent = ({tallyDevice, handleReload, handleSave, disabled}: FlasherIniContentProps) => {
  const classes = useStyles()

  if(tallyDevice === undefined) {
    return <Spinner />
  } else if (tallyDevice.path === undefined) {
    const isLocalhost = (() => {
      const hostName = window.location.hostname
      return hostName === "127.0.0.1" || hostName === "localhost" || hostName === "[::1]"
    })

    return <>
      <Alert 
        className={classes.warning} 
        severity="warning"
        action={
          <Button color="inherit" size="small" onClick={() => handleReload()}>Try again</Button>
        }
      >
        Did not find any connected device.
      </Alert>
      <Alert variant="outlined" className={classes.info} severity="info">
        <AlertTitle>Possible fixes</AlertTitle>
        <ul>
          { !isLocalhost && <li>The Tally has to be connected to the computer <em>that runs the hub</em>.</li> }
          <li>Some USB cables can just be used for charging. Make sure you use a <em>USB data cable</em>.</li>
          <li>If this has never worked from this computer ever, you might be missing the correct <ExternalLink href="https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers">USB drivers</ExternalLink>.</li>
        </ul>
      </Alert>
    </>
  } else if (tallyDevice.nodeMcuVersion === undefined) {
    return <>
      <Alert 
        className={classes.warning} 
        severity="warning"
        action={
          <Button color="inherit" size="small" onClick={() => handleReload()}>Try again</Button>
        }
      >
        Device was found, but could not determine if LUA is running.
      </Alert>
      <Alert variant="outlined" className={classes.info} severity="info">
        <AlertTitle>Possible fixes</AlertTitle>
        <ul>
          <li>This happens sporadically. It could be fixed by trying again.</li>
          <li>Make sure a firmware is flashed.</li>
        </ul>
      </Alert>
    </>
  } else {
    return <>
      { !tallyDevice.tallySettings && <Alert 
        className={classes.warning} 
        severity="warning"
      >
        tally-settings.ini does not exist yet and will be created.
      </Alert> }
      <EditSettingsIni settingsIni={tallyDevice.tallySettings} onSave={handleSave} disabled={disabled} />
    </>
  }
}
const FlasherIniPage = () => {
  // every increment will refresh tallyDevice
  const [increment, setIncrement] = useState<number>(1)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingOpen, setUploadingOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<TallySettingsIniProgressType>(undefined)
  const tallyDevice = useTallyDevice(increment)
  console.log(tallyDevice)
  const isLoading = tallyDevice === undefined

  const handleReload = () => {
    setIncrement(increment + 1)
  }

  const handleSave = (tallySettings: TallySettingsIni) => {
    setUploadProgress(undefined)
    setIsUploading(true)
    setUploadingOpen(true)
    const fnc = (progress: TallySettingsIniProgressType) => {
      if (progress.allDone || progress.error) {
        socket.off('flasher.settingsIni.progress', fnc)
        setIsUploading(false)
        if(!progress.error) { handleReload() }
      }
      setUploadProgress(progress)
    }
    socket.on('flasher.settingsIni.progress', fnc)
    socket.emit('flasher.settingsIni', tallyDevice.path, tallySettings.toString())
  }

  return (
    <Layout testId="flasher-ini">
      <MiniPage title="Flasher" addHeaderContent={<IconButton aria-label="reload" disabled={isLoading || isUploading} onClick={handleReload}><RefreshIcon /></IconButton>}>
        <Dialog
          disableBackdropClick={isUploading}
          disableEscapeKeyDown={isUploading}
          open={uploadingOpen}
        >
          <DialogTitle>Upload</DialogTitle>
          <DialogContent>
            <TallySettingsIniProgress progress={uploadProgress} />
          </DialogContent>
          <DialogActions>
            <Button disabled={isUploading} onClick={() => setUploadingOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        <FlasherIniContent tallyDevice={tallyDevice} handleReload={handleReload} handleSave={handleSave} disabled={isLoading || isUploading} />
      </MiniPage>
    </Layout>
  )
}
export default FlasherIniPage;