import React, { useState } from 'react'
import useSocketInfo from '../hooks/useSocketInfo'
import useMixerInfo from '../hooks/useMixerInfo'
import Layout from '../components/layout/Layout'
import Tally from '../domain/Tally'
import useTallies from '../hooks/useTallies'
import TallyComponent from '../components/Tally'
import { Box, Button, ButtonGroup, Container, makeStyles, Tooltip, Typography } from '@material-ui/core'
import DesktopWindowsIcon from '@material-ui/icons/DesktopWindows'
import WifiIcon from '@material-ui/icons/Wifi'
import ServerIcon from '@material-ui/icons/Dns';
import { Alert, AlertTitle } from '@material-ui/lab'


const useStyles = makeStyles(theme => {
  return {
    buttons: {
      display: "block",
      marginBottom: theme.spacing(2),
    },
    button: {
      textTransform: "none",
    },
    buttonIcon: {
      marginRight: theme.spacing(1)
    },
    alert: {
      marginBottom: theme.spacing(2)
    },
  }
})

const countConnectedTallies = tallies => {
  if(!tallies) { return null }
  return tallies.reduce((count, tally) => count + (Tally.fromJson(tally).isConnected() ? 1 : 0), 0)
}

const createTallyList = (tallies: Tally[]|null, showDisconnected: boolean, showUnpatched: boolean) => {
  if(!tallies) { return null }
  return tallies.filter(
    tally => (tally.isActive() || showDisconnected) && (tally.isPatched() || showUnpatched)
  ).sort(
    (one, two) => {
      if (one.isActive() !== two.isActive()) {
        return one.isActive() ? -1 : 1
      } else {
        return one.name.localeCompare(two.name)
      }
    }
  )
}

const IndexPage = () => {
  const rawTallies = useTallies()
  const [showDisconnected, setShowDisconnected] = useState(true)
  const [showUnpatched, setShowUnpatched] = useState(true)
  const isMixerConnected = useMixerInfo()
  const isHubConnected = useSocketInfo()
  const classes = useStyles()

  const tallies = createTallyList(rawTallies, showDisconnected, showUnpatched)

  const toggleDisconnected = e => {
    setShowDisconnected(!showDisconnected)
  }

  const toggleUnpatched = e => {
    setShowUnpatched(!showUnpatched)
  }

  const nrConnectedTallies = countConnectedTallies(tallies)

  function refreshPage() {
    window.location.reload(false)
    return false
  }

  return (
    <Layout>
      <div className={classes.buttons}>
        <ButtonGroup size="small" variant="contained">
          <Button className={classes.button} color={showDisconnected ? "primary" : "default"} onClick={toggleDisconnected}>Show Disconnected</Button>
          <Button className={classes.button} color={showUnpatched ? "primary" : "default"} onClick={toggleUnpatched}>Show Unpatched</Button>
          <Tooltip title={"Hub " + (isHubConnected ? "connected" : "disconnected")}>
            <Button className={classes.button} color="default" variant="outlined"><DesktopWindowsIcon className={classes.buttonIcon} /> {isHubConnected ? 1 : 0}</Button>
          </Tooltip>
          <Tooltip title={"Video Mixer " + (isMixerConnected ? "connected" : "disconnected")}>
            <Button className={classes.button} color="default" variant="outlined"><ServerIcon className={classes.buttonIcon} /> {isMixerConnected ? 1 : 0}</Button>
          </Tooltip>
          <Tooltip title={nrConnectedTallies + " connected tallies"}>
            <Button className={classes.button} color="default" variant="outlined"><WifiIcon className={classes.buttonIcon} /> {nrConnectedTallies === null ? "?" : nrConnectedTallies}</Button>
          </Tooltip>
        </ButtonGroup>
      </div>
      { isHubConnected ? "" : (
        <Alert severity="error" className={classes.alert}>
          <AlertTitle>Hub disconnected</AlertTitle>
          <Typography paragraph>The displayed information might be outdated.</Typography>
          <Typography>We will try to reconnect automatically, but you might also try to reload the page.</Typography>
        </Alert>
      )}
      <Box display="flex" flexWrap="wrap" justifyContent="flex-start" alignItems="flex-start" alignContent="flex-start">
        {tallies ? tallies.map(tally => <TallyComponent tally={tally} key={tally.name} />) : "" /* @TODO: loading */}
      </Box>
    </Layout>
  )
}

export default IndexPage;