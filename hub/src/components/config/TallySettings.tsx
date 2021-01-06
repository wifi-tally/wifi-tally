import { Button, FormControl, FormLabel, makeStyles } from '@material-ui/core'
import React, { useMemo, useState } from 'react'
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
  },
  footer: {
    borderTop: "solid 1px " + theme.palette.background.default,
    margin: theme.spacing(0, -2),
    padding: theme.spacing(2, 2, 0, 2),
    textAlign: "right",
  }
}))

function TallySettings() {
  const settings = useDefaultTallyConfiguration()
  const [operatorBrightness, setOperatorBrightness] = useState<number>(undefined)
  const [stageBrightness, setStageBrightness] = useState<number>(undefined)
  const [operatorColorScheme, setOperatorColorScheme] = useState<ColorSchemeId>(undefined)
  const [stageColorScheme, setStageColorScheme] = useState<ColorSchemeId>(undefined)
  useMemo(() => {
    // called when setting changed
    setOperatorBrightness(settings?.getOperatorLightBrightness())
    setStageBrightness(settings?.getStageLightBrightness())
    setOperatorColorScheme(settings?.getOperatorColorScheme())
    setStageColorScheme(settings?.getStageColorScheme())
  }, [settings])

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
      <FormControl classes={{root: classes.input}}>
        <FormLabel className={classes.label}>Operator Light Brightness</FormLabel>
        <BrightnessSlider
          testId="tally-defaults-ob"
          minValue={DefaultTallyConfiguration.minOperatorLightBrightness}
          minMessage="Operator Light can not be turned off."
          value={operatorBrightness} 
          onChange={(value) => {setOperatorBrightness(value)}}
        />
      </FormControl>
      <FormControl classes={{root: classes.input}}>
        <FormLabel className={classes.label}>Operator Light Colors</FormLabel>
        <ColorSchemeSelector 
          testId="tally-defaults-oc"
          value={operatorColorScheme}
          onChange={(value) => {setOperatorColorScheme(value)}}
        />
      </FormControl>
      <FormControl classes={{root: classes.input}}>
        <FormLabel className={classes.label}>Stage Light Brightness</FormLabel>
        <BrightnessSlider 
          testId="tally-defaults-sb"
          value={stageBrightness} 
          onChange={(value) => {setStageBrightness(value)}}
        />
      </FormControl>
      <FormControl classes={{root: classes.input}}>
        <FormLabel className={classes.label}>Stage Light Colors</FormLabel>
        <ColorSchemeSelector
          testId="tally-defaults-sc"
          value={stageColorScheme}
          onChange={(value) => {setStageColorScheme(value)}}
        />
      </FormControl>
      <div className={classes.footer}>
        <Button data-testid="tally-defaults-submit" type="submit" variant="contained" color="primary">Save</Button>
      </div>
    </form>)}
  </MiniPage> 
}

export default TallySettings