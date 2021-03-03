import { CircularProgress, fade, makeStyles, Step, StepLabel, Stepper } from '@material-ui/core'
import React from 'react'
import { TallySettingsIniProgressType } from '../flasher/NodeMcuConnector'
import CancelIcon from '@material-ui/icons/Cancel'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import PauseCircleFilledRoundedIcon from '@material-ui/icons/PauseCircleFilledRounded'
import useTallies from '../hooks/useTallies'

const useStyles = makeStyles((theme) => {
  return {
    iconCompleted: {
      color: theme.palette.success.dark,
    },
    iconError: {
      color: theme.palette.error.main,
    },
    iconCurrent: {
      color: theme.palette.primary.main,
    },
    vertical: {
      "& .MuiStepConnector-root": {
        margin: theme.spacing(0, 0, 0, 1.5),
        padding: theme.spacing(0.5, 0),
      },
      "& .MuiStepConnector-line": {
        minHeight: theme.spacing(1.5),
        borderLeftWidth: theme.spacing(0.5),
        borderColor: fade(theme.palette.common.white, 0.7),
      },
    },
  }
})

type StepType = {
  id: string
  label: string
  done: boolean
  active: boolean
  error: boolean
  skipped: boolean
}

function getSteps(progress: TallySettingsIniProgressType, isTallyConnected: boolean): StepType[] {
  const steps: any = [
    {
      id: "initialize",
      label: "Initializing",
      done: progress?.inititalizeDone,
    },
    {
      id: "connection",
      label: "Establishing connection",
      done: progress?.connectionDone,
    },
    {
      id: "upload",
      label: "Uploading tally-settings.ini",
      done: progress?.uploadDone,
    },
    {
      id: "reboot",
      label: "Rebooting Tally to apply settings",
      done: progress?.rebootDone,
    },
    {
      id: "done",
      label: "Upload Done",
      done: progress?.allDone,
    },
    {
      id: "connected",
      label: "Tally is connected to Hub",
      done: progress?.allDone && isTallyConnected,
    },
  ]

  let lastDone = true
  let hadError = false
  for (const step of steps) {
    step.active = lastDone && step.done === false
    step.error = step.active && progress?.error
    step.skipped = hadError
    if (!hadError) {
      // first step that errored
      hadError = true
    }
    lastDone = step.done
  }
  return steps
}

type TheStepIconProps = {
  step: StepType
  classCurrent?: string
  classDone?: string
  classError?: string
}

function TheStepIcon({step, classCurrent, classDone, classError}: TheStepIconProps) {
  if(step.error) {
    return <CancelIcon className={classError} />
  } else if(step.done) {
    return <CheckCircleIcon className={classDone} />
  } else if (step.active) {
    return <CircularProgress thickness={7.2} style={{width: "1.71em", height: "1.71em" }} />
  } else {
    return <PauseCircleFilledRoundedIcon className={classCurrent} />
  }
}

type Props = {
  progress?: TallySettingsIniProgressType
}
function TallySettingsIniProgress({progress} : Props) {
  const tallies = useTallies()
  const classes = useStyles()

  const isTallyConnected = !!tallies.find(tally => tally.name === progress?.tallyName && tally.isConnected())

  const steps = getSteps(progress, isTallyConnected)
  const currentStep = Math.max(steps.findIndex(step => step.done === false), 0)

  return <Stepper activeStep={currentStep} orientation="vertical" classes={{vertical: classes.vertical}}>
    {steps.map(step => <Step key={step.id} completed={step.done}>
      <StepLabel 
        StepIconProps={{
          icon: <TheStepIcon step={step} classDone={classes.iconCompleted} classError={classes.iconError} classCurrent={classes.iconCurrent} />,
          classes: {
            completed: classes.iconCompleted
          }
        }}
        error={step.error}>{step.label}</StepLabel>
    </Step>)}
  </Stepper>
}

export default TallySettingsIniProgress


