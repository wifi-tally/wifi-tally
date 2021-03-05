import { CircularProgress, fade, makeStyles, Step, StepLabel, Stepper } from '@material-ui/core'
import React from 'react'
import CancelIcon from '@material-ui/icons/Cancel'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import PauseCircleFilledRoundedIcon from '@material-ui/icons/PauseCircleFilledRounded'

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

export type StepType = {
  id: string
  label: string
  done: boolean
  active: boolean
  current?: number
  max?: number
  error: boolean
  skipped: boolean
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
  steps: StepType[]
}

function StepDisplay({steps} : Props) {
  const classes = useStyles()

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
        error={step.error}>{step.label}{step.max && (step.active || step.done) && ` (${step.current}/${step.max})`}</StepLabel>
    </Step>)}
  </Stepper>
}

export default StepDisplay


