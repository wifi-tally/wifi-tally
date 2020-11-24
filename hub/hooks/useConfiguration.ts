import { useState, useEffect } from 'react';
import {socket} from './useSocket'
import ConfigTracker from './tracker/config'

const configTracker = new ConfigTracker(socket)

export function useAtemConfiguration() {
  const [atemConfiguration, setAtemConfiguration] = useState(configTracker.atemConfiguration)

  const onChange = newAtemConnection => {
    setAtemConfiguration(newAtemConnection)
  }

  useEffect(() => {
    configTracker.on("atem", onChange)
    return () => {
      // cleanup
      configTracker.off("atem", onChange)
    }
  })

  return atemConfiguration
}
