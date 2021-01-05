import { Button, FormControl, FormLabel, makeStyles } from '@material-ui/core'
import React, { useState } from 'react'
import { useDefaultTallyConfiguration } from '../../hooks/useConfiguration'
import { socket } from '../../hooks/useSocket'
import { ColorSchemeId } from '../../tally/ColorScheme'
import { DefaultTallyConfiguration } from '../../tally/TallyConfiguration'
import MiniPage from '../layout/MiniPage'
import Spinner from '../layout/Spinner'
import BrightnessSlider from './BrightnessSlider'
import ColorSchemeSelector from './ColorSchemeSelector'

const useStyle = makeStyles((theme) => ({
  label: {
    display: "block",
    marginBottom: theme.spacing(2),
  },
  input: {
    margin: theme.spacing(0, 2, 2, 0),
    display: "block",
  }
}))

function TallySettings() {
  const settings = useDefaultTallyConfiguration((newSettings) => {
    setOperatorBrightness(newSettings.getOperatorLightBrightness())
    setStageBrightness(newSettings.getStageLightBrightness())
    setOperatorColorScheme(newSettings.getOperatorColorScheme())
    setStageColorScheme(newSettings.getStageColorScheme())
  })
  const [operatorBrightness, setOperatorBrightness] = useState<number>(undefined)
  const [stageBrightness, setStageBrightness] = useState<number>(undefined)
  const [operatorColorScheme, setOperatorColorScheme] = useState<ColorSchemeId>(undefined)
  const [stageColorScheme, setStageColorScheme] = useState<ColorSchemeId>(undefined)

  const classes = useStyle()
  const isLoading = !settings

  const handleSubmit = (event) => {
    event.preventDefault()
    operatorBrightness !== undefined && settings.setOperatorLightBrightness(operatorBrightness)
    stageBrightness !== undefined && settings.setStageLightBrightness(stageBrightness)
    operatorColorScheme !== undefined && settings.setOperatorColorScheme(operatorColorScheme)
    stageColorScheme !== undefined && settings.setStageColorScheme(stageColorScheme)

    socket.emit('config.change.tallyconfig', settings.toJson())
  }

  return <MiniPage data-testid="tally-defaults" title="Tally Defaults">
    { isLoading ? <Spinner /> : (<form onSubmit={handleSubmit}>
      <FormControl data-testid="tally-defaults-ob" classes={{root: classes.input}}>
        <FormLabel className={classes.label}>Operator Light Brightness</FormLabel>
        <BrightnessSlider
          minValue={DefaultTallyConfiguration.minOperatorLightBrightness}
          minMessage="Operator Light can not be turned off."
          defaultValue={settings.getOperatorLightBrightness()} 
          onChange={(value) => {setOperatorBrightness(value)}}
        />
      </FormControl>
      <FormControl data-testid="tally-defaults-oc" data-value={operatorColorScheme} classes={{root: classes.input}}>
        <FormLabel className={classes.label}>Operator Light Colors</FormLabel>
        <ColorSchemeSelector 
          testId="tally-defaults-oc"
          value={operatorColorScheme}
          onChange={(value) => {setOperatorColorScheme(value)}}
        />
      </FormControl>
      <FormControl data-testid="tally-defaults-sb"  classes={{root: classes.input}}>
        <FormLabel className={classes.label}>Stage Light Brightness</FormLabel>
        <BrightnessSlider 
          defaultValue={settings.getStageLightBrightness()} 
          onChange={(value) => {setStageBrightness(value)}}
        />
      </FormControl>
      <FormControl data-testid="tally-defaults-sc" data-value={stageColorScheme} classes={{root: classes.input}}>
        <FormLabel className={classes.label}>Stage Light Colors</FormLabel>
        <ColorSchemeSelector
          testId="tally-defaults-sc"
          value={stageColorScheme}
          onChange={(value) => {setStageColorScheme(value)}}
        />
      </FormControl>
      <Button data-testid="tally-defaults-submit" type="submit" variant="contained" color="primary">Save</Button>
    </form>)}
  </MiniPage> 
}

export default TallySettings