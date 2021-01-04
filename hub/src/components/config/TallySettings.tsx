import { Button, FormControl, FormLabel, makeStyles } from '@material-ui/core'
import React, { useState } from 'react'
import { useDefaultTallyConfiguration } from '../../hooks/useConfiguration'
import { socket } from '../../hooks/useSocket'
import { DefaultTallyConfiguration } from '../../tally/TallyConfiguration'
import MiniPage from '../layout/MiniPage'
import Spinner from '../layout/Spinner'
import BrightnessSlider from './BrightnessSlider'

const useStyle = makeStyles((theme) => ({
  input: {
    margin: theme.spacing(0, 2, 2, 0),
    display: "block",
  }
}))

function TallySettings() {
  const settings = useDefaultTallyConfiguration()
  const [operatorBrightness, setOperatorBrightness] = useState<number>(undefined)
  const [stageBrightness, setStageBrightness] = useState<number>(undefined)

  const classes = useStyle()
  const isLoading = !settings

  const handleSubmit = (event) => {
    event.preventDefault()
    operatorBrightness !== undefined && settings.setOperatorLightBrightness(operatorBrightness)
    stageBrightness !== undefined && settings.setStageLightBrightness(stageBrightness)

    socket.emit('config.change.tallyconfig', settings.toJson())
  }

  return <MiniPage data-testid="tally-defaults" title="Tally Defaults">
    { isLoading ? <Spinner /> : (<form onSubmit={handleSubmit}>
      <FormControl data-testid="tally-defaults-ob" classes={{root: classes.input}}>
        <FormLabel>Operator Light Brightness</FormLabel>
        <BrightnessSlider
          minValue={DefaultTallyConfiguration.minOperatorLightBrightness}
          minMessage="Operator Light can not be turned off."
          defaultValue={settings.getOperatorLightBrightness()} 
          onChange={(value) => {setOperatorBrightness(value)}}
        />
      </FormControl>
      <FormControl data-testid="tally-defaults-sb"  classes={{root: classes.input}}>
        <FormLabel>Stage Light Brightness</FormLabel>
        <BrightnessSlider 
          defaultValue={settings.getStageLightBrightness()} 
          onChange={(value) => {setStageBrightness(value)}}
        />
      </FormControl>
      <Button data-testid="tally-defaults-submit" type="submit" variant="contained" color="primary">Save</Button>
    </form>)}
  </MiniPage> 
}

export default TallySettings