import { Button, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles, Paper, TextField, Tooltip, Typography } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React, { useState } from 'react'
import useChannels from '../hooks/useChannels'
import { socket } from '../hooks/useSocket'
import useTallies from '../hooks/useTallies'
import ChannelSelector from './ChannelSelector'

const useStyles = makeStyles(theme => {
  return {
    root: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "dashed 1px " + theme.palette.grey[700],
      width: "250px",
      margin: theme.spacing(1),
      padding: theme.spacing(2),
      overflow: "hidden",
      background: "transparent",
    },
    alert: {
      marginBottom: theme.spacing(2),
    },
    formWrapper: {
      margin: "0 auto",
      maxWidth: "250px",
    },
    mb: {
      marginBottom: theme.spacing(2),
    }
  }
})

const createTally = function (tallyName, channelId) {
  socket.emit('tally.create', tallyName, channelId || undefined)
}

type TallyCreatePopupProps = {
  classes: Record<string, string>
  open: boolean
  onClose: () => void
}

const maxLength = 26 // same as "tally.name" in tally

function TallyCreatePopup({classes, open, onClose}: TallyCreatePopupProps) {
  const channels = useChannels()
  const tallies = useTallies()
  const [channelId, setChannelId] = useState<string>(undefined)
  const [name, setName] = useState<string>("");
  const hasUdpTally = !!tallies?.find(tally => tally.isUdpTally())
  
  let errorMessage = ""
  if (name === "") {
    errorMessage = "Please enter a name"
  } else if (name.length > maxLength) {
    errorMessage = `name must not be longer than ${maxLength} characters`
  } else if (tallies?.find(tally => tally.name === name)) {
    errorMessage = `a tally with the name ${name} already exists`
  }

  function handleCreate() {
    console.log(channelId)
    createTally(name, channelId)
    onClose()
  }

  return (
    <Dialog data-testid="tally-create-popup" maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle>Create Web Tally</DialogTitle>
      <DialogContent>
        { !hasUdpTally ? (
          <Alert className={classes.alert} severity="warning" variant="outlined" data-testid="tally-create-warning">
            Hardware-Tallies, based on ESP8266, will automatically register and should not
            be created via this form.
          </Alert>
        ) : "" }
        <Typography paragraph>A Web Tally, that can be viewed in any browser.</Typography>

        <div className={classes.formWrapper}>
          <TextField
            className={classes.mb}
            data-testid="tally-create-name"
            label="Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            autoFocus={true}
          />
          <ChannelSelector value={channelId} channels={channels} onChange={setChannelId} />
        </div>
        
        <DialogActions>
          <Button onClick={onClose} color="default" data-testid="tally-create-cancel">Cancel</Button>
          <Tooltip title={errorMessage}><div>
            <Button disabled={!!errorMessage} color="primary" variant="contained" data-testid="tally-create-ok" onClick={handleCreate}>Create</Button>
          </div></Tooltip>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

function TallyCreate() {
  const classes = useStyles()
  const [modalOpen, setModalOpen] = useState(false)
  
  return (
    <Paper variant="outlined" className={classes.root}>
      <Button onClick={() => setModalOpen(true)} data-testid={`tally-create`}>Create Web Tally</Button>
      <TallyCreatePopup open={modalOpen} onClose={() => setModalOpen(false)} classes={classes} />
    </Paper>
  )
}

export default TallyCreate
