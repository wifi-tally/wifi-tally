import { Button, Checkbox, FormControlLabel, makeStyles, Typography } from '@material-ui/core'
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
  input: {
    margin: theme.spacing(0, 2, 2, 0),
    display: "block",
  },
  footer: {
    borderTop: "solid 1px " + theme.palette.background.default,
    margin: theme.spacing(0, -2),
    padding: theme.spacing(2, 2, 0, 2),
    textAlign: "right",
  },
  checkboxLabel: {
    fontSize: "1em",
  }
}))

function TallySettings() {
  const settings = useDefaultTallyConfiguration()
  const [operatorBrightness, setOperatorBrightness] = useState<number>(undefined)
  const [stageBrightness, setStageBrightness] = useState<number>(undefined)
  const [operatorColorScheme, setOperatorColorScheme] = useState<ColorSchemeId>(undefined)
  const [stageColorScheme, setStageColorScheme] = useState<ColorSchemeId>(undefined)
  const [stageShowsPreview, setStageShowsPreview] = useState<boolean>(undefined)
  const [operatorShowsIdle, setOperatorShowsIdle] = useState<boolean>(undefined)
  useMemo(() => {
    // called when setting changed
    setOperatorBrightness(settings?.getOperatorLightBrightness())
    setStageBrightness(settings?.getStageLightBrightness())
    setOperatorColorScheme(settings?.getOperatorColorScheme())
    setStageColorScheme(settings?.getStageColorScheme())
    setStageShowsPreview(settings?.getStageShowsPreview())
    setOperatorShowsIdle(settings?.getOperatorShowsIdle())
  }, [settings])

  const classes = useStyle()
  const isLoading = !settings

  const handleSubmit = (event) => {
    event.preventDefault()
    operatorBrightness !== undefined && settings.setOperatorLightBrightness(operatorBrightness)
    stageBrightness !== undefined && settings.setStageLightBrightness(stageBrightness)
    operatorColorScheme !== undefined && settings.setOperatorColorScheme(operatorColorScheme)
    stageColorScheme !== undefined && settings.setStageColorScheme(stageColorScheme)
    stageShowsPreview !== undefined && settings.setStageShowsPreview(stageShowsPreview)
    operatorShowsIdle !== undefined && settings.setOperatorShowsIdle(operatorShowsIdle)

    socket.emit('config.change.tallyconfig', settings.toJson())
  }

  return <MiniPage data-testid="tally-defaults" title="Tally Defaults">
    { isLoading ? <Spinner /> : (<form onSubmit={handleSubmit}>
      <div className={classes.input}>
        <Typography paragraph variant="h6">Operator Light Brightness</Typography>
        <BrightnessSlider
          testId="tally-defaults-ob"
          minValue={DefaultTallyConfiguration.minOperatorLightBrightness}
          minMessage="Operator Light can not be turned off."
          value={operatorBrightness} 
          onChange={(value) => {setOperatorBrightness(value)}}
        />
      </div>
      <div className={classes.input}>
        <Typography paragraph variant="h6">Operator Light Colors</Typography>
        <ColorSchemeSelector 
          testId="tally-defaults-oc"
          value={operatorColorScheme}
          onChange={(value) => {setOperatorColorScheme(value)}}
        />
      </div>
      <div className={classes.input}>
        <Typography paragraph variant="h6">Operator Display</Typography>
        <FormControlLabel
          classes={{label: classes.checkboxLabel}}
          control={<Checkbox
            data-testid="tally-defaults-oi"
            data-value={operatorShowsIdle}
            checked={operatorShowsIdle}
            color="primary"
            onChange={(e) => {setOperatorShowsIdle(e.target.checked)}}
            size="small"
          />}
          label="Shows Idle State"
        />
      </div>
      <div className={classes.input}>
        <Typography paragraph variant="h6">Stage Light Brightness</Typography>
        <BrightnessSlider 
          testId="tally-defaults-sb"
          value={stageBrightness} 
          onChange={(value) => {setStageBrightness(value)}}
        />
      </div>
      <div className={classes.input}>
        <Typography paragraph variant="h6">Stage Light Colors</Typography>
        <ColorSchemeSelector
          testId="tally-defaults-sc"
          value={stageColorScheme}
          onChange={(value) => {setStageColorScheme(value)}}
        />
      </div>
      <div className={classes.input}>
        <Typography paragraph variant="h6">Stage Display</Typography>
        <FormControlLabel
          classes={{label: classes.checkboxLabel}}
          control={<Checkbox
            data-testid="tally-defaults-sp"
            data-value={stageShowsPreview}
            checked={stageShowsPreview}
            color="primary"
            onChange={(e) => {setStageShowsPreview(e.target.checked)}}
            size="small"
          />}
          label="Shows Preview State"
        />
      </div>
      <div className={classes.footer}>
        <Button data-testid="tally-defaults-submit" type="submit" variant="contained" color="primary">Save</Button>
      </div>
    </form>)}
  </MiniPage> 
}

export default TallySettings