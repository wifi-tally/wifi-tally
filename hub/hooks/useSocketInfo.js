import { useState, useEffect } from 'react';
import {socketEventEmitter, socket} from './useSocket'

function useSocketInfo() {
  const [isHubConnected, setIsHubConnected] = useState(socket.connected)

  const onConnection = () => {
    setIsHubConnected(true)
  }
  const onDisconnection = () => {
    setIsHubConnected(false)
  }

  useEffect(() => {
    socketEventEmitter.on("connected", onConnection)
    socketEventEmitter.on("disconnected", onDisconnection)
    return () => {
      // cleanup
      socketEventEmitter.off("connected", onConnection)
      socketEventEmitter.off("disconnected", onDisconnection)
    }
  })

  return isHubConnected
}

export default useSocketInfo
