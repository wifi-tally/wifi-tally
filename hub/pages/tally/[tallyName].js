import { useState } from 'react'
import fetch from 'isomorphic-unfetch'
import {useSocket} from '../../hooks/useSocket'
import Layout from '../../components/Layout'

const Tally = require('../../domain/Tally')
const Log = require('../../domain/Log')

const TallyDetails = props => {
  const [tally, setTally] = useState(Tally.fromValueObject(props.tally))
  const [logs, setLogs] = useState(props.logs.map(log => Log.fromValueObject(log)))

  const socket = useSocket('tally.logged.' + tally.name, log => {
    const newLogs = logs.slice()
    newLogs.push(Log.fromValueObject(log))
    setLogs(newLogs)
  })

  const format = (log, idx) => {
    var className = "log "
    if(log.isWarning()) {
      className = className + "bg-warning "
    } else if (log.isError()) {
      className = className + "bg-danger "
    } else if (log.isStatus()) {
      className = className + "bg-primary "
    }

    return (
      <div key={idx} className={className}>
        <time className="log-date" date={log.dateTime.toISOString()}>{log.dateTime.toISOString()}</time><div className="log-msg">{log.message}</div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="page card">
        <h4 className="card-header">{tally.name}'s Logs</h4>
        <div className="card-body">
          {logs.map(format)}
        </div>
      </div>
    </Layout>
  )
}

TallyDetails.getInitialProps = async (context) => {
  const { tallyName } = context.query;
  const baseUrl = context && context.req ? `${context.req.protocol}://${context.req.get('Host')}` : '';
  const response = await fetch(baseUrl + '/tally?tallyName=' + tallyName)
  const data = await response.json()

  return data
}

export default TallyDetails;