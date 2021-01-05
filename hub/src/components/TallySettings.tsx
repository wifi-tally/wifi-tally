import { Dialog, DialogTitle, DialogContent, DialogActions, Button, makeStyles, FormLabel, Switch, FormControlLabel, fade } from '@material-ui/core';
import React, { useState } from 'react'
import Tally from '../domain/Tally';
import { useDefaultTallyConfiguration } from '../hooks/useConfiguration';
import { socket } from '../hooks/useSocket';
import { ColorSchemeId } from '../tally/ColorScheme';
import { DefaultTallyConfiguration } from '../tally/TallyConfiguration';
import BrightnessSlider from './config/BrightnessSlider';
import ColorSchemeSelector from './config/ColorSchemeSelector';
import Spinner from './layout/Spinner';

const useStyles = makeStyles(theme => ({
  input: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  label: {
    marginBottom: theme.spacing(2),
  },
  toggleLabelActive: {
    fontSize: "smaller",
    color: fade(theme.palette.common.white, 0.7),
  },
  toggleLabelInactive: {
    fontSize: "smaller",
    color: fade(theme.palette.common.white, 0.3),
  },
  toggleLabelPlacementStart: {
    marginLeft: theme.spacing(4),
  },
  labels: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  }
}))

type TallySettingsProps = {
  tally: Tally
  open: boolean
  onClose?: () => void
}

function TallySettings({tally, open, onClose}: TallySettingsProps) {
  const defaultSettings = useDefaultTallyConfiguration()
  const settings = tally.configuration
  const [oldDefaultSettings, setOldDefaultSettings] = useState(undefined)
  const [oldSettings, setOldSettings] = useState(undefined)
  // operatorBrightness
  const [ob, setOb] = useState<number>(settings && settings.getOperatorLightBrightness())
  const [isObDefault, setObDefault] = useState(settings && settings.getOperatorLightBrightness() === undefined)
  // stageBrightness
  const [sb, setSb] = useState<number>(settings && settings.getStageLightBrightness())
  const [isSbDefault, setSbDefault] = useState(settings && settings.getOperatorLightBrightness() === undefined)
  // operatorColor
  const [oc, setOc] = useState<ColorSchemeId>(settings ? settings.getOperatorColorScheme() : undefined)
  const [isOcDefault, setOcDefault] = useState(settings && settings.getOperatorColorScheme() === undefined)
  // stageColor
  const [sc, setSc] = useState<ColorSchemeId>(settings ? settings.getStageColorScheme() : undefined)
  const [isScDefault, setScDefault] = useState(settings && settings.getStageColorScheme() === undefined)

  if (defaultSettings !== oldDefaultSettings) {
    setOldDefaultSettings(defaultSettings)
    if (defaultSettings) {
      if (isObDefault) { setOb(defaultSettings.getOperatorLightBrightness()) }
      if (isSbDefault) { setSb(defaultSettings.getStageLightBrightness()) }
      if (isOcDefault) { setOc(defaultSettings.getOperatorColorScheme()) }
      if (isScDefault) { setSc(defaultSettings.getStageColorScheme()) }
    }
  }
  if (settings !== oldSettings) {
    setOldSettings(settings)

    if (settings) {
      const newIsObDefault = settings.getOperatorLightBrightness() === undefined
      const newIsSbDefault = settings.getStageLightBrightness() === undefined
      const newIsOcDefault = settings.getOperatorColorScheme() === undefined
      const newIsScDefault = settings.getStageColorScheme() === undefined
      setObDefault(newIsObDefault)
      setSbDefault(newIsSbDefault)
      setOcDefault(newIsOcDefault)
      setScDefault(newIsScDefault)

      if (!newIsObDefault) { setOb(settings.getOperatorLightBrightness()) }
      if (!newIsSbDefault) { setSb(settings.getStageLightBrightness()) }
      if (!newIsOcDefault) { setOc(settings.getOperatorColorScheme()) }
      if (!newIsScDefault) { setSc(settings.getStageColorScheme()) }
    }
  }

  const isLoading = !defaultSettings || !tally
  const classes = useStyles()
  
  const handleSave = (e) => {
    e.preventDefault()
    if (!tally) { return }
    const settings = tally.configuration
    settings.setOperatorLightBrightness(isObDefault ? undefined : ob)
    settings.setOperatorColorScheme((isOcDefault) ? undefined : oc)
    settings.setStageLightBrightness((!tally.hasStageLight || isSbDefault) ? undefined : sb)
    settings.setStageColorScheme((!tally.hasStageLight || isScDefault) ? undefined : sc)
    socket.emit('tally.settings', tally.name, tally.type, settings.toJson())
    onClose && onClose()
  }

  return (
    <Dialog data-testid="tally-settings-popup" fullWidth={true} maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle>Configure {tally.name}</DialogTitle>
      <form onSubmit={handleSave}>
      <DialogContent>
        { isLoading ? (<Spinner />) : (<>
        <div data-testid="tally-defaults-ob" className={classes.input}>
          <div className={classes.labels}>
            <FormLabel className={classes.label}>Operator Light Brightness</FormLabel>
            <FormControlLabel
              classes={{label: isObDefault ? classes.toggleLabelActive : classes.toggleLabelInactive, labelPlacementStart: classes.toggleLabelPlacementStart}}
              labelPlacement="start"
              control={<Switch data-testid="tally-defaults-ob-toggle" size="small" color="primary" checked={isObDefault} onChange={(e, checked) => setObDefault(checked)} />}
              label="Use default"
            />
          </div>
          <BrightnessSlider
            disabled={isObDefault}
            minValue={DefaultTallyConfiguration.minOperatorLightBrightness}
            minMessage="Operator Light can not be turned off."
            defaultValue={isObDefault ? defaultSettings.getOperatorLightBrightness() : ob}
            onChange={(value) => {setOb(value)}}
          />
        </div>
        <div data-testid="tally-defaults-oc" data-value={oc} className={classes.input}>
          <div className={classes.labels}>
            <FormLabel className={classes.label}>Operator Light Colors</FormLabel>
            <FormControlLabel
              classes={{label: isOcDefault ? classes.toggleLabelActive : classes.toggleLabelInactive, labelPlacementStart: classes.toggleLabelPlacementStart}}
              labelPlacement="start"
              control={<Switch data-testid="tally-defaults-oc-toggle" size="small" color="primary" checked={isOcDefault} onChange={(e, checked) => setOcDefault(checked)} />}
              label="Use default"
            />
          </div>
          <ColorSchemeSelector 
            testId="tally-defaults-oc"
            value={oc}
            onChange={(value) => {setOc(value)}}
            disabled={isOcDefault}
          />
        </div>
        { tally.hasStageLight && (<>
          <div data-testid="tally-defaults-sb" className={classes.input}>
            <div className={classes.labels}>
              <FormLabel className={classes.label}>Stage Light Brightness</FormLabel>
              <FormControlLabel
                classes={{label: isSbDefault ? classes.toggleLabelActive : classes.toggleLabelInactive, labelPlacementStart: classes.toggleLabelPlacementStart}}
                labelPlacement="start"
                control={<Switch data-testid="tally-defaults-sb-toggle" size="small" color="primary" checked={isSbDefault} onChange={(e, checked) => setSbDefault(checked)} />}
                label="Use default"
              />
            </div>
            <BrightnessSlider
              disabled={isSbDefault}
              defaultValue={isSbDefault ? defaultSettings.getStageLightBrightness() : sb}
              onChange={(value) => {setSb(value)}}
            />
          </div>
          <div data-testid="tally-defaults-sc" data-value={sc} className={classes.input}>
            <div className={classes.labels}>
              <FormLabel className={classes.label}>Stage Light Colors</FormLabel>
              <FormControlLabel
                classes={{label: isScDefault ? classes.toggleLabelActive : classes.toggleLabelInactive, labelPlacementStart: classes.toggleLabelPlacementStart}}
                labelPlacement="start"
                control={<Switch data-testid="tally-defaults-sc-toggle" size="small" color="primary" checked={isScDefault} onChange={(e, checked) => setScDefault(checked)} />}
                label="Use default"
              />
            </div><ColorSchemeSelector
              testId="tally-defaults-sc"
              value={sc}
              onChange={(value) => {setSc(value)}}
              disabled={isScDefault}
            />
          </div>
        </>)}
        </>) }
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="default" data-testid="tally-settings-close">Cancel</Button>
        <Button disabled={isLoading} color="primary" variant="contained" data-testid="tally-settings-submit" type="submit">Save</Button>
      </DialogActions>
      </form>
    </Dialog>
  )
}

export default TallySettings