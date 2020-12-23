import { useState, useEffect } from 'react';
import {socket, socketEventEmitter} from './useSocket'
import ChannelTracker from './tracker/channel'

const channelTracker = new ChannelTracker(socket, socketEventEmitter)

function useChannels() {
  const [channels, setChannels] = useState(channelTracker.channels)

  const onChange = (tallies) => {
    setChannels(tallies)
  }

  useEffect(() => {
    channelTracker.on("channels", onChange)
    return () => {
      // cleanup
      channelTracker.off("channels", onChange)
    }
  })

  return channels
}

export default useChannels
