import { FormHelperText, makeStyles, TextField } from '@material-ui/core'
import React from 'react'
import WirecastConfiguration, { WirecastConfigurationLiveMode } from '../WirecastConfiguration'

const useStyles = makeStyles(theme => {
  return {
    root: {
      marginBottom: theme.spacing(2)
    }
  }
})

type WirecastLiveModeSelectProps = {
  label: string
  testId: string
  value: WirecastConfigurationLiveMode
  onChange: (value: WirecastConfigurationLiveMode) => void
}

const options = {
  always: {
    label: "Always",
    help: "",
  },
  stream: {
    label: "Only when streaming",
    help: "Tally Lights will not show on-air status unless Wirecast is streaming.",
  },
  record: {
    label: "Only when recording",
    help: "Tally Lights will not show on-air status unless Wirecast is recording.",
  },
  streamOrRecord: {
    label: "When recording or streaming",
    help: "Tally Lights will not show on-air status unless Wirecast is recording or streaming.",
  },
}

function WirecastLiveModeSelect({label, testId, value, onChange}: WirecastLiveModeSelectProps) {
  const classes = useStyles()

  const currentOption = options[value]

  const handleChange = e => {
    const value = e.target.value.toString()
    if (WirecastConfiguration.isValidLiveMode(value)) {
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

export default WirecastLiveModeSelect
