import { useEffect } from 'react'
import io from 'socket.io-client'
const EventEmitter = require('events')
const socketEventEmitter = new EventEmitter()

const socket = io()

const onConnection = function() {
  socketEventEmitter.emit("connected")
}
const onDisconnection = function() {
  socketEventEmitter.emit("disconnected")
}
if (typeof window !== 'undefined') {
  // on client only
  socket.on("connect", onConnection)
  socket.on("connect_error", onDisconnection)
  socket.on("connect_timeout", onDisconnection)
  socket.on("disconnected", onDisconnection)
  socket.on("reconnect", onDisconnection)
  socket.on("reconnecting", onDisconnection)
  socket.on("reconnect_error", onDisconnection)
  socket.on("reconnect_failed", onDisconnection)
}

const useSocket = function (eventName, cb) {
  useEffect(() => {
    socket.on(eventName, cb)

    return function useSocketCleanup() {
      socket.off(eventName, cb)
    }
  }, [eventName, cb])

  return socket
}

export {useSocket, socketEventEmitter}