import MockUdpTally from '../MockUdpTally'
import io from 'socket.io-client'
import { ClientSideSocket } from '../../src/lib/SocketEvents'
import { ChannelList } from '../../src/lib/MixerCommunicator'
import TestConfiguration from '../../src/mixer/test/TestConfiguration'

const mixer = function(config: Cypress.PluginConfigOptions) {
  const socket : ClientSideSocket = io(config.baseUrl)

  function mixerProgPrev({programs, previews}: {programs: ChannelList, previews: ChannelList}) {
    const config = new TestConfiguration()
    config.previews = previews
    config.programs = programs
    socket.emit('config.change.test', config.toJson(), "test")

    return null
  }

  return {
    mixerProgPrev,
  }
}

export default mixer