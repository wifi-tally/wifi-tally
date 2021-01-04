import { Dialog, DialogTitle, DialogContent, DialogActions, Button, makeStyles, FormLabel, Switch, FormControlLabel, fade } from '@material-ui/core';
import React, { useState } from 'react'
import Tally from '../domain/Tally';
import { useDefaultTallyConfiguration } from '../hooks/useConfiguration';
import { socket } from '../hooks/useSocket';
import { DefaultTallyConfiguration } from '../tally/TallyConfiguration';
import BrightnessSlider from './config/BrightnessSlider';
import Spinner from './layout/Spinner';

const useStyles = makeStyles(theme => ({
  input: {
    margin: theme.spacing(0, 0, 2, 0),
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

  if (defaultSettings !== oldDefaultSettings) {
    setOldDefaultSettings(defaultSettings)
    if (defaultSettings) {
      if (isObDefault) { setOb(defaultSettings.getOperatorLightBrightness()) }
      if (isSbDefault) { setSb(defaultSettings.getStageLightBrightness()) }
    }
  }
  if (settings !== oldSettings) {
    setOldSettings(settings)

    if (settings) {
      const newIsObDefault = settings.getOperatorLightBrightness() === undefined
      const newIsSbDefault = settings.getStageLightBrightness() === undefined
      setObDefault(newIsObDefault)
      setSbDefault(newIsSbDefault)

      if (!newIsObDefault) { setOb(settings.getOperatorLightBrightness()) }
      if (!newIsSbDefault) { setSb(settings.getStageLightBrightness()) }
    }
  }

  const isLoading = !defaultSettings || !tally
  const classes = useStyles()
  
  const handleSave = (e) => {
    e.preventDefault()
    if (!tally) { return }
    const settings = tally.configuration
    settings.setOperatorLightBrightness(isObDefault ? undefined : ob)
    settings.setStageLightBrightness((!tally.hasStageLight || isSbDefault) ? undefined : sb)
    socket.emit('tally.settings', tally.name, tally.type, settings.toJson())
    onClose && onClose()
  }

  return (
    <Dialog data-testid="tally-settings-popup" maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle>Configure {tally.name}</DialogTitle>
      <form onSubmit={handleSave}>
      <DialogContent>
        { isLoading ? (<Spinner />) : (<>
        <div data-testid="tally-defaults-ob" className={classes.input}>
          <div className={classes.labels}>
            <FormLabel>Operator Light Brightness</FormLabel>
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
        { tally.hasStageLight && (<>
          <div data-testid="tally-defaults-sb" className={classes.input}>
            <div className={classes.labels}>
              <FormLabel>Stage Light Brightness</FormLabel>
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