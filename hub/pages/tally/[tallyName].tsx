import React from 'react'
import Layout from '../../components/Layout'

import useTallyLog from '../../hooks/useTallyLog'

const Log = (log, idx) => {
  let className = "log "
  if(log.isWarning()) {
    className = className + "bg-warning "
  } else if (log.isError()) {
    className = className + "bg-danger "
  } else if (log.isStatus()) {
    className = className + "bg-primary "
  }

  return (
    <div key={idx} className={className}>
      <time className="log-date">{log.dateTime.toISOString()}</time><div className="log-msg">{log.message}</div>
    </div>
  )
}

const TallyDetails = ({tallyName}) => {
  const logs = useTallyLog(tallyName)

  return (
    <Layout>
      <div className="page card">
        <h4 className="card-header">{tallyName}'s Logs</h4>
        <div className="card-body">
          {logs ? logs.map(Log) : "" /* @TODO: loading */ }
        </div>
      </div>
    </Layout>
  )
}

TallyDetails.getInitialProps = async (context) => {
  return {
    tallyName: context.query.tallyName
  }
}

export default TallyDetails;