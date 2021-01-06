import { darken, FormHelperText, makeStyles, Slider } from '@material-ui/core'
import React, { useState } from 'react'

const useStyle = makeStyles(theme => ({
  slider: {
    padding: theme.spacing(2, 0, 0, 0)
  },
  sliderDisabled: {
    "&.MuiSlider-root": {
      color: darken(theme.palette.common.white, 0.6)
    }
  },
}))

type BrightnessSliderProps = {
  value: number|null
  testId: string
  onChange: (value: number) => void
  minValue?: number
  minMessage?: string
  disabled?: boolean
}

const marks = [
  {value: 0},
  {value: 20},
  {value: 40},
  {value: 60},
  {value: 80},
  {value: 100},
]

function BrightnessSlider({value, testId, onChange, minValue, minMessage, disabled}: BrightnessSliderProps) {
  minValue = minValue || 0
  disabled = disabled || false
  const [isFocused, setFocused] = useState(false)
  const classes = useStyle()

  const handleChange = (e, value) => {
    value = Math.max(value as number, minValue)
    onChange && onChange(value)
  }

  return (
    <div className={classes.slider}>
      <Slider 
        data-testid={testId}
        value={value} 
        min={0} 
        max={100}
        marks={marks}
        disabled={disabled}
        color="primary"
        valueLabelDisplay="auto" 
        valueLabelFormat={val => val === 0 ? "off" : `${val}%`} 
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        classes={{disabled: classes.sliderDisabled}}
      />
      {minMessage && isFocused && value === minValue && (<FormHelperText disabled={true}>{minMessage}</FormHelperText>)}
    </div>
  )
}

export default BrightnessSlider