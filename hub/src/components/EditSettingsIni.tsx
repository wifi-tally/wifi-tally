import { Button, makeStyles, TextField } from '@material-ui/core'
import React, { useEffect, useMemo, useState } from 'react'
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
    }
  }
})

type EditTallySettingsProps = {
  settingsIni: TallySettingsIni
  onSave: (t: TallySettingsIni) => void
}

const EditSettingsIni = ({settingsIni, onSave}: EditTallySettingsProps) => {
  const [ini, setIni] = useState<TallySettingsIni>(settingsIni)
  const [stringContent, setStringContent] = useState(settingsIni.toString())
  const [expertMode, setExpertMode] = useState(false)

  useMemo(() => {
    setIni(settingsIni)
    setStringContent(settingsIni.toString())
  }, [settingsIni])
  const classes = useStyles()

  return (<div className={classes.root}>
    <Button onClick={() => setExpertMode(!expertMode) }>Expert Mode</Button>
    { expertMode ? 
      <TextField multiline 
        fullWidth={true}
        label="tally-settings.ini"
        className={classes.textarea} 
        rows={ini.lines.length + 1} 
        value={stringContent}
        onChange={(e) => {
          const value = e.currentTarget.value
          setIni(new TallySettingsIni(value))
          setStringContent(value)
        }}
      />
    : <>
      <TextField label="Name" value={ini.getTallyName()} className={classes.textField} onChange={(e) => {
        const value = e.currentTarget.value
        const clone = ini.clone()
        clone.setTallyName(value)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      <TextField label="Ssid" value={ini.getStationSsid()} className={classes.textField} onChange={(e) => {
        const value = e.currentTarget.value
        const clone = ini.clone()
        clone.setStationSsid(value)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      <TextField label="Password" value={ini.getStationPassword()} className={classes.textField} onChange={(e) => {
        const value = e.currentTarget.value
        const clone = ini.clone()
        clone.setStationPassword(value)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      <TextField label="Hub IP" value={ini.getHubIp()} className={classes.textField} onChange={(e) => {
        const value = e.currentTarget.value
        const clone = ini.clone()
        clone.setHubIp(value)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      <TextField label="Hub Port" value={ini.getHubPort()} className={classes.textField} onChange={(e) => {
        const value = e.currentTarget.value
        const number = parseInt(value, 10)
        const clone = ini.clone()
        clone.setHubPort(isNaN(number) ? 0: number)
        setIni(clone)
        setStringContent(clone.toString())
      }} />
      </>
    }
    <Button color="primary" variant="contained" onClick={ () => {onSave(ini)} }>Save</Button>
  </div>)
}

export default EditSettingsIni
