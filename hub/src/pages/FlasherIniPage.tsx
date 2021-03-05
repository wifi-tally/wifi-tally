import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, makeStyles, Typography } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import React, { useEffect, useState } from 'react'
import EditSettingsIni from '../components/EditSettingsIni';
import ExternalLink from '../components/ExternalLink';
import Layout from '../components/layout/Layout'
import MiniPage from '../components/layout/MiniPage';
import Spinner from '../components/layout/Spinner';
import TallySettingsIniProgress from '../components/flasher/TallySettingsProgress';
import { TallyProgramProgressType, TallySettingsIniProgressType } from '../flasher/NodeMcuConnector';
import TallyDevice, { TallyDeviceObjectType } from '../flasher/TallyDevice';
import TallySettingsIni from '../flasher/TallySettingsIni';
import RefreshIcon from '@material-ui/icons/Refresh';
import { socket } from '../hooks/useSocket';
import Help from '../components/flasher/Help';
import ProgramProgress from '../components/flasher/ProgramProgress';

const useStyles = makeStyles(theme => {
  return {
    warning: {
      marginBottom: theme.spacing(2),
    },
    success: {
      marginBottom: theme.spacing(2),
    },
  }
})

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

const FlasherIniPage = () => {
  // every increment will refresh tallyDevice
  const [increment, setIncrement] = useState<number>(1)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingOpen, setUploadingOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<TallySettingsIniProgressType>(undefined)
  const [programProgress, setProgramProgress] = useState<TallyProgramProgressType>(undefined)
  const tallyDevice = useTallyDevice(increment)
  const isLoading = tallyDevice === undefined

  const classes = useStyles()

  const handleReload = () => {
    setIncrement(increment + 1)
  }

  const handleSettingsIniSave = (tallySettings: TallySettingsIni) => {
    setUploadProgress(undefined)
    setProgramProgress(undefined)
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
  
  const handleProgram = () => {
    setUploadProgress(undefined)
    setProgramProgress(undefined)
    setIsUploading(true)
    setUploadingOpen(true)
    const fnc = (progress: TallyProgramProgressType) => {
      if (progress.allDone || progress.error) {
        socket.off('flasher.program.progress', fnc)
        setIsUploading(false)
        if(!progress.error) { handleReload() }
      }
      setProgramProgress(progress)
    }
    socket.on('flasher.program.progress', fnc)
    socket.emit('flasher.program', tallyDevice.path)
  }

  return (
    <Layout testId="flasher-ini">
      <Dialog
        disableBackdropClick={isUploading}
        disableEscapeKeyDown={isUploading}
        open={uploadingOpen}
      >
        <DialogTitle>Upload</DialogTitle>
        <DialogContent>
          { uploadProgress && <TallySettingsIniProgress progress={uploadProgress} /> }
          { programProgress && <ProgramProgress progress={programProgress} /> }
        </DialogContent>
        <DialogActions>
          <Button disabled={isUploading} onClick={() => setUploadingOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <MiniPage title="Flasher" addHeaderContent={<IconButton aria-label="reload" disabled={isLoading || isUploading} onClick={handleReload}><RefreshIcon /></IconButton>}>
        <Typography paragraph>
          This tool allows to update the configuration or software of a Hardware Tally light.
        </Typography>
        { tallyDevice === undefined ? (
          <Spinner />
        ) : (
          <Help tallyDevice={tallyDevice} onReload={handleReload} />
        )}
      </MiniPage>
      { (tallyDevice?.update === "updateable" || tallyDevice?.update === "up-to-date") && <MiniPage title="Software Update">
        { tallyDevice?.update === "up-to-date" && <Alert
          className={classes.success}
          variant="outlined"
          severity="success">
            The software on this Tally is up to date.
        </Alert>}
        { tallyDevice?.update === "updateable" && <Button onClick={handleProgram}>Update NOW</Button>}
      </MiniPage>}
      { tallyDevice?.nodeMcuVersion !== undefined && <MiniPage title="Edit tally-settings.ini">
        { !tallyDevice.tallySettings && <Alert 
          className={classes.warning} 
          severity="warning"
        >
          tally-settings.ini does not exist yet and will be created.
        </Alert> }
        <EditSettingsIni settingsIni={tallyDevice.tallySettings} onSave={handleSettingsIniSave} disabled={isLoading || isUploading} />
      </MiniPage>}
    </Layout>
  )
}
export default FlasherIniPage;