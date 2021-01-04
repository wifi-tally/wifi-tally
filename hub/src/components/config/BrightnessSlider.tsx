import { FormControl, FormHelperText, FormLabel, makeStyles, Slider } from '@material-ui/core'
import React, { useState } from 'react'

const useStyle = makeStyles(theme => ({
  slider: {
    padding: theme.spacing(2, 0, 0, 0)
  }
}))

type BrightnessSliderProps = {
  label: string
  testId: string
  defaultValue: number|null
  className?: string
  onChange: (value: number) => void
  minValue?: number
  minMessage?: string
}

const marks = [
  {value: 0},
  {value: 20},
  {value: 40},
  {value: 60},
  {value: 80},
  {value: 100},
]

function BrightnessSlider({label, testId, defaultValue, className, onChange, minValue, minMessage}: BrightnessSliderProps) {
  minValue = minValue || 0
  const [oldDefaultValue, setOldDefaultValue] = useState(defaultValue)
  const [value, setValue] = useState(defaultValue)
  const [isFocused, setFocused] = useState(false)
  const classes = useStyle()

  if (defaultValue !== oldDefaultValue) {
    setOldDefaultValue(defaultValue)
    setValue(defaultValue)
  }

  const handleChange = (e, value) => {
    value = Math.max(value as number, minValue)
    setValue(value)
  }
  const handleChangeCommitted = (e, value) => {
    value = Math.max(value as number, minValue)
    onChange && onChange(value)
  }

  return (
    <FormControl data-testid={testId} className={className}>
      <FormLabel>{label}</FormLabel>
      <div className={classes.slider}>
        <Slider 
          value={value} 
          min={0} 
          max={100}
          marks={marks}
          color="primary"
          valueLabelDisplay="auto" 
          valueLabelFormat={val => val === 0 ? "off" : `${val}%`} 
          onChange={handleChange}
          onChangeCommitted={handleChangeCommitted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {minMessage && isFocused && value === minValue && (<FormHelperText disabled={true}>{minMessage}</FormHelperText>)}
      </div>
    </FormControl>
  )
}

export default BrightnessSlider