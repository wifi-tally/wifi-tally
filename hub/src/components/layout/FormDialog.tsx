import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, IconButton, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

const useStyles = makeStyles(theme => ({
  title: {
    borderBottom: "1px solid " + theme.palette.background.default,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingRight: theme.spacing(1),
  },
  content: {
    overflow: "hidden", // the bubble on the slider glitches sometimes
  },
  actions: {
    borderTop: "1px solid " + theme.palette.background.default,
    display: "flex",
    justifyContent: "space-between",
  },
  actionsLeft: {
  },
}))

type FormDialogProps = {
  "data-testid": string
  label: string
  onSubmit?: () => void
  onClose: () => void
  isLoading?: boolean
} & DialogProps

function FormDialog(props: FormDialogProps) {
  const {label, onSubmit, onClose, isLoading} = props
  const testId = props["data-testid"]
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'))
  const classes = useStyles()

  return (
    <Dialog fullWidth={true} fullScreen={fullScreen} maxWidth="sm" scroll="body" {...props}>
      <form onSubmit={(e) => {
        e.preventDefault()
        onSubmit && onSubmit()
      }}>
        <DialogTitle className={classes.title} disableTypography={true}>
          <Typography variant="h1">{label}</Typography>
          <IconButton aria-label="Close Dialog" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.content}>
          {props.children}
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button onClick={onClose} color="default" data-testid={`${testId}-close`}>Cancel</Button>
          <Button disabled={isLoading} color="primary" variant="contained" data-testid={`${testId}-submit`} type="submit">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default FormDialog