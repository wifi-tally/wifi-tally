import React from 'react'
import Layout from '../components/layout/Layout'
import MiniPage from '../components/layout/MiniPage'
import useTallyLog from '../hooks/useTallyLog'
import LogType from '../domain/Log'
import { makeStyles } from '@material-ui/core'
import { useParams } from "react-router-dom"

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
    <div key={idx} className={classNames.join(" ")}>
      <time className={classes.logDate}>{log.dateTime.toISOString()}</time><div>{log.message}</div>
    </div>
  )
}

const TallyLogPage = () => {
  const { tallyName } = useParams()
  const logs = useTallyLog(tallyName)
  const classes = useStyles()

  return (
    <Layout testId="tally-log">
      <MiniPage title={`${tallyName}'s Logs`} contentPadding="0">
        {logs ? logs.map((log, idx) => <Log log={log} idx={idx} classes={classes} />) : "" /* @TODO: loading */ }
      </MiniPage>
    </Layout>
  )
}

TallyLogPage.getInitialProps = async (context) => {
  return {
    tallyName: context.query.tallyName
  }
}

export default TallyLogPage;