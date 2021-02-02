import { FormHelperText, makeStyles, Typography } from '@material-ui/core'
import React from 'react'
import ChipLikeButton from '../../../components/ChipLikeButton'

const useStyles = makeStyles(theme => {
  return {
    root: {
      marginBottom: theme.spacing(2),
    },
    chip: {
      margin: theme.spacing(0, 2, 2, 0),
    }

  }
})

type WirecastLayerSelectProps = {
  label: string
  testId: string
  value: number[]|null
  errorText?: string
  onChange: (value: number[]|null) => void
}

const minLayer = 1
const maxLayer = 5

function WirecastLayerSelect({label, testId, value, errorText, onChange}: WirecastLayerSelectProps) {
  const classes = useStyles()
  const data = []
  for (let i = minLayer; i<=maxLayer; i++) {
    data.push({
      idx: i,
      active: value === null || value.includes(i),
    })
  }

  console.log(value, data)

  const handleClick = (idx) => {
    const newValue = []
    
    data.forEach(dat => {
      let active = dat.active
      if (idx === dat.idx) {
        active = !active
      }
      if (active) {
        newValue.push(dat.idx)
      }
    })

    const isDefault = newValue.length === (maxLayer - minLayer + 1)
    if (isDefault) {
      onChange(null)
    } else {
      onChange(newValue)
    }
  }

  return <div className={classes.root} data-testid={testId}>
    <Typography paragraph variant="h6">{label}</Typography>
    {data.map(dat => (
      <ChipLikeButton 
        key={dat.idx} 
        className={classes.chip} 
        selected={dat.active} 
        data-testid={`${testId}-${dat.idx}`}
        onClick={() => {handleClick(dat.idx)}}>
          Layer {dat.idx}
      </ChipLikeButton>
    ))}
    { errorText && <FormHelperText error={true}>{errorText}</FormHelperText> }
    <FormHelperText disabled={true}>Only show shots from the selected layers to keep the interface clean.</FormHelperText>
  </div>
}

export default WirecastLayerSelect
