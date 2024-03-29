import { Button, FormControlLabel, makeStyles, Switch, TextField } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import TallySettingsIni from '../flasher/TallySettingsIni'

const useStyles = makeStyles((theme) => {
  return {
    root: {},
    textarea: {
      fontFamily: "monospace",
      marginBottom: theme.spacing(2),
    },
    textField: {
      display: "block",
      marginBottom: theme.spacing(2),
    },
    expertMode: {
      display: "block",
      textAlign: "right",
    },
    footer: {
      borderTop: "solid 1px " + theme.palette.background.default,
      margin: theme.spacing(0, -2),
      padding: theme.spacing(2, 2, 0, 2),
      textAlign: "right",
    },
  }
})

type EditTallySettingsProps = {
  settingsIni: TallySettingsIni
  disabled: boolean
  onSave: (t: TallySettingsIni) => void
}

const EditSettingsIni = ({settingsIni, onSave, disabled}: EditTallySettingsProps) => {
  const [ini, setIni] = useState<TallySettingsIni>(settingsIni)
  const [stringContent, setStringContent] = useState(settingsIni?.toString())
  const [expertMode, setExpertMode] = useState(false)

  useEffect(() => {
    setIni(settingsIni)
    setStringContent(settingsIni?.toString())
  }, [settingsIni])
  const classes = useStyles()

  return (<div className={classes.root}>
    <FormControlLabel
      data-testid="tally-settings-expert"
      data-expertmode={expertMode ? "true" : "false"}
      className={classes.expertMode}
      control={<Switch
        size="small"
        color="primary"
        disabled={disabled}
        checked={expertMode}
        onChange={() => setExpertMode(!expertMode)}
      />} label="Expert Mode"
    />
    { expertMode ? 
      <TextField multiline 
        fullWidth={true}
        label="tally-settings.ini"
        className={classes.textarea} 
        rows={(ini?.lines.length || 0) + 1} 
        value={stringContent || ""}
        disabled={disabled} 
        data-testid="tally-settings-all"
        onChange={(e) => {
          const value = e.currentTarget.value
          setIni(new TallySettingsIni(value))
          setStringContent(value)
        }}
      />
    : <>
      <TextField label="Name" disabled={disabled} value={ini?.getTallyName() || ""} className={classes.textField} data-testid="tally-settings-name" onChange={(e) => {
        const value = e.currentTarget.value
        const clone = ini?.clone() || new TallySettingsIni()
        clone.setTallyName(value)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      <TextField label="Ssid" disabled={disabled} value={ini?.getStationSsid() || ""} className={classes.textField} data-testid="tally-settings-ssid" onChange={(e) => {
        const value = e.currentTarget.value
        const clone = ini?.clone() || new TallySettingsIni()
        clone.setStationSsid(value)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      <TextField label="Password" disabled={disabled} value={ini?.getStationPassword() || ""} className={classes.textField} data-testid="tally-settings-password" onChange={(e) => {
        const value = e.currentTarget.value
        const clone = ini?.clone() || new TallySettingsIni()
        clone.setStationPassword(value)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      <TextField label="Hub IP" disabled={disabled} value={ini?.getHubIp() || ""} className={classes.textField} data-testid="tally-settings-ip" onChange={(e) => {
        const value = e.currentTarget.value
        const clone = ini?.clone() || new TallySettingsIni()
        clone.setHubIp(value)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      <TextField label="Hub Port" disabled={disabled} value={ini?.getHubPort() || ""} className={classes.textField} data-testid="tally-settings-port" onChange={(e) => {
        const value = e.currentTarget.value
        const number = parseInt(value, 10)
        const clone = ini?.clone() || new TallySettingsIni()
        clone.setHubPort(isNaN(number) ? 0: number)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      </>
    }
    <div className={classes.footer}>
      <Button color="primary" disabled={disabled} variant="contained" data-testid="tally-settings-submit" onClick={ () => {onSave(ini)} }>Save</Button>
    </div>
  </div>)
}

export default EditSettingsIni
