import { useState, useEffect } from 'react';
import {socket, socketEventEmitter} from './useSocket'
import TallyTracker from './tracker/tally'

const tallyTracker = new TallyTracker(socket, socketEventEmitter)

function useTallies() {
  const [tallies, setTallies] = useState(tallyTracker.tallies)

  const onChange = (tallies) => {
    setTallies(tallies)
  }

  useEffect(() => {
    tallyTracker.on("tallies", onChange)
    return () => {
      // cleanup
      tallyTracker.off("tallies", onChange)
    }
  })

  return tallies
}

export default useTallies
