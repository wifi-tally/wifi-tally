import { Atem } from "atem-connection"

const tasks = function(config: Cypress.PluginConfigOptions) {
  let atem: Atem|null = null

  const atemConnect = ({ip, port}: {ip: string, port: number}) => {
    atem = new Atem({})
    console.log(`Connecting to ATEM at ${ip}:${port}`)
    atem.connect(ip, port)

    atem.on('info', console.log)
    atem.on('error', console.error)
    atem.on('connected', () => {
      console.log("ATEM connected")
    })
    atem.on('disconnected', () => {
      console.log("ATEM disconnected")
    })

    return new Promise((resolve) => {
      atem.once('connected', () => {
        resolve(null)
      })
    })
  }

  const atemPreview = (preview: number) => {
    if (!atem) {
      return Promise.reject('atem has not been started with the atemConnect task')
    }

    return atem.changePreviewInput(preview).then(() => null)
  }
  const atemProgram = (program: number) => {
    if (!atem) {
      return Promise.reject('atem has not been started with the atemConnect task')
    }

    return atem.changeProgramInput(program).then(() => null)
  }
  const atemChannelName = ({channelId, short, long}: {channelId: number, short: string, long?: string}) => {
    
    if (!atem) {
      return Promise.reject('atem has not been started with the atemConnect task')
    }
    const channel = atem.state.inputs[channelId]
    if (!channel) {
      return Promise.reject(`Invalid channelId ${channelId}. Valid: ${Object.keys(atem.state).join(", ")}`)
    }
    
    channel.shortName = short
    channel.longName = long || short

    return atem.setInputSettings(channel, channelId).then(() => null)
  }

  const atemDisconnect = () => {
    if(atem) {
      atem.disconnect()
    }
    return null
  }

  return {
    atemConnect,
    atemDisconnect,
    atemChannelName,
    atemPreview,
    atemProgram,
  }
}

export default tasks
