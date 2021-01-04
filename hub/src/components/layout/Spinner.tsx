import { CircularProgress, makeStyles } from '@material-ui/core'
import React from 'react'

const useStyles = makeStyles((theme) => ({
  root: {
    display: "block",
    margin: "0 auto",
  }
}))

function Spinner() {
  const classes = useStyles()
  return (
      <CircularProgress classes={{root: classes.root}} color="inherit" />
  )
}

export default Spinner
