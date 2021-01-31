import React, { useEffect, useState } from 'react'
import { withRouter } from "react-router"
import { socket } from '../hooks/useSocket'
import { WebTally, WebTallyObjectType } from '../domain/Tally'
import { CircularProgress, darken, fade, IconButton, makeStyles, Typography, useTheme } from '@material-ui/core'
import { useParams } from "react-router-dom"
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit'
import { FullScreen, useFullScreenHandle } from "react-full-screen"
import TuneIcon from '@material-ui/icons/Tune'
import NoSleepJs from 'nosleep.js'
import { StateCommand } from '../tally/CommandCreator'
import PageNotFound from './PageNotFound'
import TallySettings from '../components/TallySettings'
import { useDefaultTallyConfiguration } from '../hooks/useConfiguration'
import ColorSchemes from '../tally/ColorScheme'


const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center", 
    padding: theme.spacing(2),

    backgroundColor: theme.palette.grey[800],
    color: fade(theme.palette.getContrastText(theme.palette.grey[800]), 0.7)
  },
  '@keyframes highlight': {
    from: {
      backgroundColor: '#fff',
      color: fade(theme.palette.getContrastText('#fff'), 0.7)
    },
    "50%": {
      backgroundColor: '#000',
      color: fade(theme.palette.getContrastText('#000'), 0.7)
    },
    to: {
      backgroundColor: '#fff',
      color: fade(theme.palette.getContrastText('#fff'), 0.7)
    },
  },
  highlight: {
    animationName: '$highlight',
    animationDuration: '0.25s',
    animationTimingFunction: 'step-start',
    animationIterationCount: 'infinite',
    backgroundColor: '#000',
    color: fade(theme.palette.getContrastText('#000'), 0.7)
  },
  spinner: {
    width: "30vw",
    height: "30vh",
  },
  name: {
    color: "inherit",
  },
  fullscreenIcon: {
    color: "inherit",
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  settingsIcon: {
    color: "inherit",
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
  }
}))

function useWebTally(tallyName: string) {
  const [tally, setTally] = useState<WebTally>()
  const [command, setCommand] = useState<StateCommand>()
  const [isValid, setIsValid] = useState<boolean>()

  useEffect(() => {
    const onChange = ({tally: tallyData, command} : {tally: WebTallyObjectType, command: StateCommand}) => {
      const tally = WebTally.fromJson(tallyData)
      setTally(tally)
      setCommand(command)
    }
  
    const onInvalid = (theTallyName: string) => {
      if (tallyName === theTallyName) {
        setTally(undefined)
        setCommand(undefined)
        setIsValid(false)
      }
    }

    const onDisconnect = () => {
      socket.off('webTally.state', onChange)
      socket.off('webTally.invalid', onInvalid)
      socket.connected && socket.emit('events.webTally.unsubscribe', tallyName)
      setTally(undefined)
      setCommand(undefined)
      setIsValid(true)
    }

    const onConnect = () => {
      socket.emit('events.webTally.subscribe', tallyName)
      socket.on('webTally.state', onChange)
      socket.on('webTally.invalid', onInvalid)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    
    socket.connected && onConnect()
    return () => {
      // cleanup
      onDisconnect()
    }
  }, [tallyName])

  return {
    tally,
    command,
    isValid,
  }
}

function WebTallyPage() {
  const { tallyId } = useParams<{tallyId: string}>()
  const tallyName = tallyId.replace(/^web-/, "")
  const { tally, command, isValid } = useWebTally(tallyName)
  const defaultTallyConfiguration = useDefaultTallyConfiguration()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const isLoading = !tally || !command
  const classes = useStyles()
  const theme = useTheme()
  const handle = useFullScreenHandle()
  // @TODO: nosleep is quite hacky, so use https://caniuse.com/?search=Wake%20Lock%20API sooner or later
  const [noSleep] = useState(new NoSleepJs())
  useEffect(() => {return () => {
    // make sure no-sleep is turned off when unmounted
    noSleep.disable()
  }}, [noSleep])

  if (isValid === false) {
    return <PageNotFound>Tally with name <strong>{tallyName}</strong> not found.</PageNotFound>
  }

  const colorSchemeId = tally?.configuration?.getOperatorColorScheme() || defaultTallyConfiguration?.getOperatorColorScheme() || "default"
  const colorScheme = ColorSchemes.getById(colorSchemeId)
  const classRoot: string[] = [classes.root]
  let dataColor = ""
  let bgColor = theme.palette.grey[800]
  let text = ""
  let showSpinner = false
  if (isLoading) {
    dataColor = "loading"
    text = "Waiting for data"
    showSpinner = true
  } else if (command === "highlight") {
    classRoot.push(classes.highlight)
    dataColor = "highlight"
    text = "Highlight"
  } else if (command === "on-air") {
    bgColor = colorScheme.program.toCss()
    text = "On Program"
    dataColor = "program"
  } else if (command === "preview") {
    bgColor = colorScheme.preview.toCss()
    text = "On Preview"
    dataColor = "preview"
  } else if (command === "release") {
    bgColor = colorScheme.idle.toCss()
    dataColor = "idle"
    text = "Idle"
  } else if (command === "unknown") {
    dataColor = "unknown"
    text = "No connection to Mixer"
    showSpinner = true
  } else {
    // if typescript fails here, we forgot a case
    ((a: never) => {})(command)
  }

  const brightness = (tally?.configuration?.getOperatorLightBrightness() || defaultTallyConfiguration?.getOperatorLightBrightness() || 100) / 100
  bgColor = darken(bgColor, 1 - brightness)
  const textColor = theme.palette.getContrastText(bgColor)

  const enterFullScreen = () => {
    noSleep.enable()
    handle.enter()
  }
  const exitFullScreen = () => {
    noSleep.disable()
    handle.exit()
  }

  return <FullScreen handle={handle}>
    <div data-testid="page-tally-web" data-color={dataColor} data-brightness={brightness} className={classRoot.join(" ")} style={{backgroundColor: bgColor, color: textColor}}>
      { showSpinner ? (
        <CircularProgress className={classes.spinner} color="inherit" size="min(30vw, 30vh)" />
      ) : (<>
        <Typography component="div" variant="h1" className={classes.name}>{(tally && tally.name) || ""}</Typography>
        <IconButton data-testid="tally-settings-link" className={classes.settingsIcon} aria-label="Show settings" onClick={() => setSettingsOpen(true)}>
          <TuneIcon />
        </IconButton>
        <TallySettings tally={tally} open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        { handle.active ? (
          <IconButton className={classes.fullscreenIcon} aria-label="Exit fullscreen" onClick={exitFullScreen}>
            <FullscreenExitIcon />
          </IconButton>
        ) : (
          <IconButton className={classes.fullscreenIcon} aria-label="Enter fullscreen" onClick={enterFullScreen}>
            <FullscreenIcon />
          </IconButton>
        )}
      </>)}
      { text && <Typography component="div">{text}</Typography>}
      
    </div>
  </FullScreen>
}

export default withRouter(WebTallyPage)
