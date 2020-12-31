import { useState, useEffect } from 'react';
import {socket, socketEventEmitter} from './useSocket'
import TallyLogTracker from './tracker/tallylog';

const tallyLogTracker = new TallyLogTracker(socket, socketEventEmitter)

function useTallyLog(tallyId: string) {
  const [logs, setLogs] = useState(tallyLogTracker.logs?.get(tallyId))

  const onChange = (logs) => {
    setLogs(Array.from(logs)) // needs a copy or refresh of component won't trigger
  }

  useEffect(() => {
    tallyLogTracker.on(`log.${tallyId}`, onChange)
    return () => {
      // cleanup
      tallyLogTracker.off(`log.${tallyId}`, onChange)
    }
  }, [tallyId])

  return logs
}

export default useTallyLog
