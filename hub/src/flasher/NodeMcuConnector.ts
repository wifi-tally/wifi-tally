import nodemcuLib from 'nodemcu-tool'
import TallyDevice from './TallyDevice'
import TallySettingsIni from './TallySettingsIni'

const baudRate = 115200
const fileName = "tally-settings.ini"

class NodeMcuConnector {
  nodemcu: any

  // injectable for easier testing
  constructor(nodemcu: any = nodemcuLib) {
    this.nodemcu = nodemcu
    this.nodemcu.onError((error:any) => {
      console.error(error)
    })
  }

  getDevice(): Promise<TallyDevice> {
    return new Promise((resolve, reject) => {
      const tallyDevice = new TallyDevice()

      const result = this.nodemcu.listDevices()
      .then((list) => {
        // only support the first one
        const device = list[0]
        if (device) {
          console.debug(`Found a device on ${device.path}`)
          
          tallyDevice.path = device.path
          tallyDevice.vendorId = device.vendorId
          tallyDevice.productId = device.productId

          return this.nodemcu.connect(device.path, baudRate).then(() => {
            return this.nodemcu.deviceInfo()
          })
          .then(deviceInfo => {
    
            tallyDevice.chipId = deviceInfo.chipID
            tallyDevice.flashId = deviceInfo.flashID
            tallyDevice.nodeMcuVersion = deviceInfo.version
            tallyDevice.nodeMcuModules = deviceInfo.modules

            return this.nodemcu.fsinfo()
          })
          .then(fsinfo => {
            const settingsFileExists = fsinfo.files.some(file => file.name === fileName)

            if (settingsFileExists) {
              return this.nodemcu.download(fileName).then(res => {
                tallyDevice.tallySettings = new TallySettingsIni(res.toString())
              })
            } else {
              return Promise.resolve()
            }
          })
        }
      })
      .catch(e => {
        console.error(e)
        tallyDevice.errorMessage = e
      })
      .finally(() => {
        if(this.nodemcu && this.nodemcu.isConnected()) { this.nodemcu.disconnect() }
        resolve(tallyDevice)
      })
      return result
    })
  }
}

export default NodeMcuConnector