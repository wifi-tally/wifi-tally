import { useState, useEffect } from 'react';
import {socket, socketEventEmitter} from './useSocket'
import TallyLogTracker from './tracker/tallylog';

const tallyLogTracker = new TallyLogTracker(socket, socketEventEmitter)

function useTallyLog(tallyName: string) {
  const [logs, setLogs] = useState(tallyLogTracker.logs?.get(tallyName))

  const onChange = (logs) => {
    setLogs(Array.from(logs)) // needs a copy or refresh of component won't trigger
  }

  useEffect(() => {
    tallyLogTracker.on(`log.${tallyName}`, onChange)
    return () => {
      // cleanup
      tallyLogTracker.off(`log.${tallyName}`, onChange)
    }
  })

  return logs
}

export default useTallyLog
