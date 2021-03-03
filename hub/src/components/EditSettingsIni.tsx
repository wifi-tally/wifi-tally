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
    }
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
        onChange={(e) => {
          const value = e.currentTarget.value
          setIni(new TallySettingsIni(value))
          setStringContent(value)
        }}
      />
    : <>
      <TextField label="Name" disabled={disabled} value={ini?.getTallyName() || ""} className={classes.textField} onChange={(e) => {
        const value = e.currentTarget.value
        const clone = ini?.clone() || new TallySettingsIni()
        clone.setTallyName(value)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      <TextField label="Ssid" disabled={disabled} value={ini?.getStationSsid() || ""} className={classes.textField} onChange={(e) => {
        const value = e.currentTarget.value
        const clone = ini?.clone() || new TallySettingsIni()
        clone.setStationSsid(value)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      <TextField label="Password" disabled={disabled} value={ini?.getStationPassword() || ""} className={classes.textField} onChange={(e) => {
        const value = e.currentTarget.value
        const clone = ini?.clone() || new TallySettingsIni()
        clone.setStationPassword(value)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      <TextField label="Hub IP" disabled={disabled} value={ini?.getHubIp() || ""} className={classes.textField} onChange={(e) => {
        const value = e.currentTarget.value
        const clone = ini?.clone() || new TallySettingsIni()
        clone.setHubIp(value)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      <TextField label="Hub Port" disabled={disabled} value={ini?.getHubPort() || ""} className={classes.textField} onChange={(e) => {
        const value = e.currentTarget.value
        const number = parseInt(value, 10)
        const clone = ini?.clone() || new TallySettingsIni()
        clone.setHubPort(isNaN(number) ? 0: number)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      </>
    }
    <Button color="primary" disabled={disabled} variant="contained" onClick={ () => {onSave(ini)} }>Save</Button>
  </div>)
}

export default EditSettingsIni
