import React from 'react'
import Layout from '../components/layout/Layout'
import MiniPage from '../components/layout/MiniPage'
import useTallyLog from '../hooks/useTallyLog'
import LogType from '../domain/Log'
import { makeStyles } from '@material-ui/core'
import { useParams } from "react-router-dom"
import useTallies from '../hooks/useTallies'

type LogProps = {
  log: LogType
  idx: number
  classes: any
}

const useStyles = makeStyles(theme => {
  return {
    logLine: {
      fontFamily: "monospace", // @TODO: should be part of the theme
      padding: theme.spacing(1, 2),
    },
    bgStatus: {
      backgroundColor: theme.palette.primary.main,
    },
    bgError: {
      backgroundColor: theme.palette.error.main,
    },
    bgWarning: {
      backgroundColor: theme.palette.warning.main,
    },
    logDate: {
      opacity: "0.5",
      fontSize: "0.8em",
    },
  }
})

const Log = ({log, idx, classes}: LogProps) => {

  const classNames = [classes.logLine]
  if(log.isWarning()) {
    classNames.push(classes.bgWarning)
  } else if (log.isError()) {
    classNames.push(classes.bgError)
  } else if (log.isStatus()) {
    classNames.push(classes.bgStatus)
  }

  return (
    <div data-testid={`log-line-${idx}`} data-severity={log.isWarning() ? "warning" : (log.isError() ? "error" : (log.isStatus() ? "status" : "info"))} key={idx} className={classNames.join(" ")}>
      <time className={classes.logDate}>{log.dateTime.toISOString()}</time><div>{log.message}</div>
    </div>
  )
}

const TallyLogPage = () => {
  const { tallyId } = useParams()
  const logs = useTallyLog(tallyId)
  const tallies = useTallies()
  const tally = tallies?.find(tally => tally.getId() === tallyId)
  const classes = useStyles()

  return (
    <Layout testId="tally-log">
      <MiniPage title={`${tally?.name}'s Logs`} contentPadding="0">
        {logs ? logs.map((log, idx) => <Log log={log} idx={idx} classes={classes} />) : "" /* @TODO: loading */ }
      </MiniPage>
    </Layout>
  )
}

export default TallyLogPage;