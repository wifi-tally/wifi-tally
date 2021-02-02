import { useState, useEffect, useCallback } from 'react';
import {socket} from './useSocket'
import ConfigTracker from './tracker/config'
import VmixConfiguration from '../mixer/vmix/VmixConfiguration';
import ObsConfiguration from '../mixer/obs/ObsConfiguration';
import MockConfiguration from '../mixer/mock/MockConfiguration';
import AtemConfiguration from '../mixer/atem/AtemConfiguration';
import { DefaultTallyConfiguration } from '../tally/TallyConfiguration';
import WirecastConfiguration from '../mixer/wirecast/WirecastConfiguration';

const configTracker = new ConfigTracker(socket)

export function useMixerNameConfiguration() {
  const [mixerName, setMixerName] = useState(configTracker.mixerName)

  const onChange = newMixerName => {
    setMixerName(newMixerName)
  }

  useEffect(() => {
    configTracker.on("mixer", onChange)
    return () => {
      // cleanup
      configTracker.off("mixer", onChange)
    }
  }, [])

  return mixerName
}
export function useAllowedMixersConfiguration() {
  const [allowedMixers, setAllowedMixers] = useState(configTracker.allowedMixers)

  const onChange = newAllowedMixers => {
    setAllowedMixers(newAllowedMixers)
  }

  useEffect(() => {
    configTracker.on("allowedMixers", onChange)
    return () => {
      // cleanup
      configTracker.off("allowedMixers", onChange)
    }
  }, [])

  return allowedMixers
}

export function useAtemConfiguration() {
  const [atemConfiguration, setAtemConfiguration] = useState<AtemConfiguration|undefined>(undefined)

  const onChange = newConf => {
    setAtemConfiguration(newConf)
  }

  useEffect(() => {
    configTracker.on("atem", onChange)
    setAtemConfiguration(configTracker.atemConfiguration)
    return () => {
      // cleanup
      configTracker.off("atem", onChange)
    }
  }, [])

  return atemConfiguration
}

export function useMockConfiguration() {
  const [mockConfiguration, setMockConfiguration] = useState<MockConfiguration|undefined>(undefined)

  const onChange = newConf => {
    setMockConfiguration(newConf)
  }

  useEffect(() => {
    configTracker.on("mock", onChange)
    setMockConfiguration(configTracker.mockConfiguration)
    return () => {
      // cleanup
      configTracker.off("mock", onChange)
    }
  }, [])

  return mockConfiguration
}

export function useObsConfiguration() {
  const [obsConfiguration, setObsConfiguration] = useState<ObsConfiguration|undefined>(undefined)

  const onChange = newConf => {
    setObsConfiguration(newConf)
  }

  useEffect(() => {
    configTracker.on("obs", onChange)
    setObsConfiguration(configTracker.obsConfiguration)
    return () => {
      // cleanup
      configTracker.off("obs", onChange)
    }
  }, [])

  return obsConfiguration
}

export function useVmixConfiguration() {
  const [vmixConfiguration, setVmixConfiguration] = useState<VmixConfiguration|undefined>(undefined)

  const onChange = newConf => {
    setVmixConfiguration(newConf)
  }

  useEffect(() => {
    configTracker.on("vmix", onChange)
    setVmixConfiguration(configTracker.vmixConfiguration)
    return () => {
      // cleanup
      configTracker.off("vmix", onChange)
    }
  }, [])

  return vmixConfiguration
}

export function useWirecastConfiguration() {
  const [wirecastConfiguration, setWirecastConfiguration] = useState<WirecastConfiguration|undefined>(undefined)

  const onChange = newConf => {
    setWirecastConfiguration(newConf)
  }

  useEffect(() => {
    configTracker.on("wirecast", onChange)
    setWirecastConfiguration(configTracker.wirecastConfiguration)
    return () => {
      // cleanup
      configTracker.off("wirecast", onChange)
    }
  }, [])

  return wirecastConfiguration
}

export function useDefaultTallyConfiguration() {
  const [configuration, setConfiguration] = useState<DefaultTallyConfiguration|undefined>(undefined)

  useEffect(() => {
    const onChange = newConf => {
      setConfiguration(newConf)
    }
    configTracker.on("tally", onChange)
    setConfiguration(configTracker.defaultTallyConfiguration)
    return () => {
      // cleanup
      configTracker.off("tally", onChange)
    }
  }, [])

  return configuration
}
