import { makeStyles, FormControlLabel, Checkbox } from '@material-ui/core';
import React, { useMemo, useState } from 'react'
import Tally from '../domain/Tally';
import { useDefaultTallyConfiguration } from '../hooks/useConfiguration';
import { socket } from '../hooks/useSocket';
import { ColorSchemeId } from '../tally/ColorScheme';
import { DefaultTallyConfiguration } from '../tally/TallyConfiguration';
import BrightnessSlider from './config/BrightnessSlider';
import ColorSchemeSelector from './config/ColorSchemeSelector';
import FormDialog from './layout/FormDialog';
import Spinner from './layout/Spinner';
import TallySettingsField from './TallySettingsField';

const useStyles = makeStyles(theme => ({
  input: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  checkboxLabel: {
    fontSize: "1em",
  }
}))

type TallySettingsProps = {
  tally: Tally
  open: boolean
  onClose?: () => void
}

function TallySettings({ tally, open, onClose }: TallySettingsProps) {
  const defaultSettings = useDefaultTallyConfiguration()
  const settings = tally.configuration
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
  // stageShowPreview
  const [sp, setSp] = useState<boolean>(settings ? settings.getStageShowsPreview() : undefined)
  const [isSpDefault, setSpDefault] = useState(settings && settings.getStageShowsPreview() === undefined)
  // operatorShowIdle
  const [oi, setOi] = useState<boolean>(settings ? settings.getOperatorShowsIdle() : undefined)
  const [isOiDefault, setOiDefault] = useState(settings && settings.getOperatorShowsIdle() === undefined)
  useMemo(() => {
    // when default settings change
    if (defaultSettings) {
      if (isObDefault) { setOb(defaultSettings.getOperatorLightBrightness()) }
      if (isSbDefault) { setSb(defaultSettings.getStageLightBrightness()) }
      if (isOcDefault) { setOc(defaultSettings.getOperatorColorScheme()) }
      if (isScDefault) { setSc(defaultSettings.getStageColorScheme()) }
      if (isSpDefault) { setSp(defaultSettings.getStageShowsPreview()) }
      if (isOiDefault) { setOi(defaultSettings.getOperatorShowsIdle()) }
    }
  }, [defaultSettings, isObDefault, isSbDefault, isOcDefault, isScDefault, isSpDefault, isOiDefault])
  useMemo(() => {
    // when settings are changed
    if (settings) {
      const newIsObDefault = settings.getOperatorLightBrightness() === undefined
      const newIsSbDefault = settings.getStageLightBrightness() === undefined
      const newIsOcDefault = settings.getOperatorColorScheme() === undefined
      const newIsScDefault = settings.getStageColorScheme() === undefined
      const newIsSpDefault = settings.getStageShowsPreview() === undefined
      const newIsOiDefault = settings.getOperatorShowsIdle() === undefined
      setObDefault(newIsObDefault)
      setSbDefault(newIsSbDefault)
      setOcDefault(newIsOcDefault)
      setScDefault(newIsScDefault)
      setSpDefault(newIsSpDefault)
      setOiDefault(newIsOiDefault)

      if (!newIsObDefault) { setOb(settings.getOperatorLightBrightness()) }
      if (!newIsSbDefault) { setSb(settings.getStageLightBrightness()) }
      if (!newIsOcDefault) { setOc(settings.getOperatorColorScheme()) }
      if (!newIsScDefault) { setSc(settings.getStageColorScheme()) }
      if (!newIsSpDefault) { setSp(settings.getStageShowsPreview()) }
      if (!newIsOiDefault) { setOi(settings.getOperatorShowsIdle()) }
    }
  }, [settings])

  const isLoading = !defaultSettings || !tally
  const classes = useStyles()

  const handleSave = () => {
    if (!tally) { return }
    const settings = tally.configuration
    settings.setOperatorLightBrightness(isObDefault ? undefined : ob)
    settings.setOperatorColorScheme((isOcDefault) ? undefined : oc)
    settings.setStageLightBrightness((!tally.hasStageLight || isSbDefault) ? undefined : sb)
    settings.setStageColorScheme((!tally.hasStageLight || isScDefault) ? undefined : sc)
    settings.setStageShowsPreview((!tally.hasStageLight || isSpDefault) ? undefined : sp)
    settings.setOperatorShowsIdle((isOiDefault) ? undefined : oi)
    socket.emit('tally.settings', tally.name, tally.type, settings.toJson())
    onClose && onClose()
  }

  return (
    <FormDialog
      data-testid="tally-settings"
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      label={`${tally.name} Settings`}
    >
      { isLoading ? (<Spinner />) : (<>
        <TallySettingsField
          label="Operator Light Brightness"
          isDefault={isObDefault}
          onChange={setObDefault}
          testId="tally-settings-ob"
          className={classes.input}
        >
          <BrightnessSlider
            testId="tally-settings-ob"
            disabled={isObDefault}
            minValue={DefaultTallyConfiguration.minOperatorLightBrightness}
            minMessage="Operator Light can not be turned off."
            value={isObDefault ? defaultSettings.getOperatorLightBrightness() : ob}
            onChange={(value) => { setOb(value) }}
          />
        </TallySettingsField>
        <TallySettingsField
          label="Operator Light Colors"
          isDefault={isOcDefault}
          onChange={setOcDefault}
          testId="tally-settings-oc"
          className={classes.input}
        >
          <ColorSchemeSelector
            testId="tally-settings-oc"
            value={oc}
            onChange={(value) => { setOc(value) }}
            disabled={isOcDefault}
          />
        </TallySettingsField>
        <TallySettingsField
          label="Operator Display"
          isDefault={isOiDefault}
          onChange={setOiDefault}
          testId="tally-settings-oi"
          className={classes.input}
        >
          <FormControlLabel
            classes={{label: classes.checkboxLabel}}
            control={<Checkbox
              data-testid="tally-settings-oi"
              data-value={isOiDefault ? defaultSettings.getOperatorShowsIdle() : oi}
              checked={isOiDefault ? defaultSettings.getOperatorShowsIdle() : oi}
              disabled={isOiDefault}
              color="primary"
              onChange={(e) => {setOi(e.target.checked)}}
              size="small"
            />}
            label="Shows Idle State"
          />
        </TallySettingsField>
        { tally.hasStageLight && (<>
        <TallySettingsField
          label="Stage Light Brightness"
          isDefault={isSbDefault}
          onChange={setSbDefault}
          testId="tally-settings-sb"
          className={classes.input}
        >
            <BrightnessSlider
              testId="tally-settings-sb"
              disabled={isSbDefault}
              value={isSbDefault ? defaultSettings.getStageLightBrightness() : sb}
              onChange={(value) => { setSb(value) }}
            />
            </TallySettingsField>
        <TallySettingsField
          label="Stage Light Colors"
          isDefault={isScDefault}
          onChange={setScDefault}
          testId="tally-settings-sc"
          className={classes.input}
        >
          <ColorSchemeSelector
              testId="tally-settings-sc"
              value={sc}
              onChange={(value) => { setSc(value) }}
              disabled={isScDefault}
            />
        </TallySettingsField>
        <TallySettingsField
          label="Stage Display"
          isDefault={isSpDefault}
          onChange={setSpDefault}
          testId="tally-settings-sp"
          className={classes.input}
        >
          <FormControlLabel
            classes={{label: classes.checkboxLabel}}
            control={<Checkbox
              data-testid="tally-settings-sp"
              data-value={isSpDefault ? defaultSettings.getStageShowsPreview() : sp}
              checked={isSpDefault ? defaultSettings.getStageShowsPreview() : sp}
              disabled={isSpDefault}
              color="primary"
              onChange={(e) => {setSp(e.target.checked)}}
              size="small"
            />}
            label="Shows Preview State"
          />
        </TallySettingsField>
        </>)}
      </>)}
    </FormDialog>
  )
}

export default TallySettings