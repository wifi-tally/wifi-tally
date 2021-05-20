import React from 'react'
import { TallySettingsIniProgressType } from '../../flasher/NodeMcuConnector'
import useTallies from '../../hooks/useTallies'
import StepDisplay, { StepType } from './StepDisplay'

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

type Props = {
  progress?: TallySettingsIniProgressType
}
function TallySettingsIniProgress({progress} : Props) {
  const tallies = useTallies()
  const isTallyConnected = !!tallies.find(tally => tally.name === progress?.tallyName && tally.isConnected())

  const steps = getSteps(progress, isTallyConnected)
  
  return <StepDisplay steps={steps} />
}

export default TallySettingsIniProgress


