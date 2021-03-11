import React from 'react'
import { Button, makeStyles } from '@material-ui/core'
import TallyDevice from '../../flasher/TallyDevice'
import { Alert, AlertTitle } from '@material-ui/lab'
import ExternalLink from '../ExternalLink'

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

type Props = {
  tallyDevice: TallyDevice
  onReload: () => void
}

function Help({tallyDevice, onReload}: Props) {
  const classes = useStyles()
  
  if (tallyDevice.path === undefined) {
    const isLocalhost = (() => {
      const hostName = window.location.hostname
      return hostName === "127.0.0.1" || hostName === "localhost" || hostName === "[::1]"
    })

    return <>
      <Alert 
        className={classes.warning} 
        severity="warning"
        action={
          <Button color="inherit" size="small" onClick={() => onReload()}>Try again</Button>
        }
      >
        Did not find any connected device.
      </Alert>
      <Alert variant="outlined" className={classes.info} severity="info">
        <AlertTitle>Possible fixes</AlertTitle>
        <ul>
          { !isLocalhost() && <li>The Tally has to be connected to the computer that <em>runs</em> the hub. It does not work on <em>remote machines</em>.</li> }
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
          <Button color="inherit" size="small" onClick={() => onReload()}>Try again</Button>
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
  }
  return <></>
}

export default Help