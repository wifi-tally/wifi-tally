import React from 'react'
import { TallyProgramProgressType } from '../../flasher/NodeMcuConnector'
import StepDisplay, { StepType } from './StepDisplay'

function getSteps(progress: TallyProgramProgressType): StepType[] {
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
      label: "Uploading files",
      current: progress?.filesUploaded,
      max: progress.filesTotal,
      done: progress.filesTotal === progress.filesUploaded,
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
  progress?: TallyProgramProgressType
}
function ProgramProgress({progress} : Props) {
  const steps = getSteps(progress)

  return <StepDisplay steps={steps} />
}

export default ProgramProgress


