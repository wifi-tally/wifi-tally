import { FormHelperText, makeStyles, TextField } from '@material-ui/core'
import React from 'react'
import ObsConfiguration, { ObsConfigurationLiveMode } from '../ObsConfiguration'

const useStyles = makeStyles(theme => {
  return {
    root: {
      marginBottom: theme.spacing(2)
    }
  }
})

type ObsLiveModeSelectProps = {
  label: string
  testId: string
  value: ObsConfigurationLiveMode
  onChange: (value: ObsConfigurationLiveMode) => void
}

const options = {
  always: {
    label: "Always",
    help: "",
  },
  stream: {
    label: "Only when streaming",
    help: "Tally Lights will not show on-air status unless OBS is streaming.",
  },
  record: {
    label: "Only when recording",
    help: "Tally Lights will not show on-air status unless OBS is recording.",
  },
  streamOrRecord: {
    label: "When recording or streaming",
    help: "Tally Lights will not show on-air status unless OBS is recording or streaming.",
  },
}

function ObsLiveModeSelect({label, testId, value, onChange}: ObsLiveModeSelectProps) {
  const classes = useStyles()

  const currentOption = options[value]

  const handleChange = e => {
    const value = e.target.value.toString()
    if (ObsConfiguration.isValidLiveMode(value)) {
      onChange(value)
    }
  }
  return <div className={classes.root}>
    <TextField select data-testid={testId} label={label} value={value} onChange={handleChange}>
      {Object.keys(options).map(key => {
        const label = options[key].label
        return <option key={key} value={key} label={label} />
      })}
    </TextField>
    {currentOption && currentOption.help && (
      <FormHelperText disabled={true}>{currentOption.help}</FormHelperText>
    )}
    
  </div>
}

export default ObsLiveModeSelect
