import NodeMcuConnector from './NodeMcuConnector'
import TallyDevice from './TallyDevice'

const mockDevice = () => {
  return {
    manufacturer: 'Silicon Labs',
    serialNumber: '0001',
    pnpId: 'usb-Silicon_Labs_CP2102_USB_to_UART_Bridge_Controller_0001-if00-port0',
    locationId: undefined,
    vendorId: '10c4',
    productId: 'ea60',
    path: '/dev/ttyUSB0'
  } 
}

const mockDeviceInfo = () => {
  return {
    version: '3.0.0',
    arch: 'esp8266',
    chipID: 'abcdef',
    flashID: '123456',
    flashsize: '4096kB',
    flashmode: '2',
    flashspeed: '40MHz',
    modules: 'encoder,file,gpio,gpio_pulse,net,node,pwm2,struct,tmr,uart,wifi,ws2812',
    lfssize: '262144kB',
    git: 'master#8d091c4'
  }
}

const mockNodeMcu = () => {
  let connected = false
  let listDevices = []
  let deviceInfo = null
  let tallySettingsIni = null


  return {
    onError: () => {},
    listDevices: () => { return Promise.resolve(listDevices) },
    deviceInfo: () => { 
      if(deviceInfo) {
        return Promise.resolve(deviceInfo)
      } else {
        throw new Error("Timeout, no response detected - is NodeMCU online and the Lua interpreter ready ?")
      }
    },
    connect: () => { 
      connected = false 
      return Promise.resolve()
    },
    download: (name: string) => { 
      if (name === "tally-settings.ini") {
        if (tallySettingsIni === null) {
          throw new Error("tally-settings.ini was not mocked. The real NodeMCU would return gibberish data.")
        } else {
          return Promise.resolve(Buffer.from(tallySettingsIni)) 
        }
      } else {
        throw new Error(`fetching of file ${name} is not implemented in mock`)
      }
    },
    fsinfo: () => {
      const totalSize = 32000
      const files: any[] = []
      if (tallySettingsIni !== null) {
        files.push({
          name: "tally-settings.ini", size: tallySettingsIni.length
        })
      }
      const usedSize = files.reduce((prev, cur) => prev + cur.size, 0)


      return {
        metadata: {
          remaining: totalSize - usedSize,
          used: usedSize,
          total: totalSize,
        },
        files: files
      }
    },
    isConnected: () => { return connected },
    disconnect: () => { connected = false },

    // for mocking
    setListDevices: (response) => listDevices = response,
    setDeviceInfo: (response) => deviceInfo = response,
    setTallySettingsIni: (response) => tallySettingsIni = response,
  }
}

describe("getDevice", () => {
  test("it handles no connected devices", () => {
    const nodemcu = mockNodeMcu()
    const connector = new NodeMcuConnector(nodemcu)

    return connector.getDevice().then(device => {
      expect(device).toEqual(new TallyDevice())
    })
  })
  test("it handles the happy path", () => {
    const nodemcu = mockNodeMcu()
    const mockDev = mockDevice()
    mockDev.path = '/dev/ttyUSB0'
    nodemcu.setListDevices([mockDev])
    const mockDevInfo = mockDeviceInfo()
    mockDevInfo.chipID = "abcd12"
    nodemcu.setDeviceInfo(mockDevInfo)
    nodemcu.setTallySettingsIni("")

    const connector = new NodeMcuConnector(nodemcu)

    return connector.getDevice().then(device => {
      expect(device.errorMessage).toBeUndefined()
      expect(device.path).toEqual("/dev/ttyUSB0")
      expect(device.chipId).toEqual("abcd12")
      expect(device.tallySettings).toBeTruthy()
      expect(device.tallySettings.getStationSsid).toBeDefined()
      expect(device.tallySettings.setStationSsid).toBeDefined()
    })
  })
  test("it works correctly if tally-settings.ini file does not exist", () => {
    const nodemcu = mockNodeMcu()
    const mockDev = mockDevice()
    mockDev.path = '/dev/ttyUSB0'
    nodemcu.setListDevices([mockDev])
    const mockDevInfo = mockDeviceInfo()
    mockDevInfo.chipID = "abcd12"
    nodemcu.setDeviceInfo(mockDevInfo)
    nodemcu.download = () => { 
      throw new Error("download should not be called here, because it will just return gibberish.")
    }

    const connector = new NodeMcuConnector(nodemcu)

    return connector.getDevice().then(device => {
      expect(device.errorMessage).toBeUndefined()
      expect(device.path).toEqual("/dev/ttyUSB0")
      expect(device.chipId).toEqual("abcd12")
      expect(device.tallySettings).toBeUndefined()
    })
  })
  test("it handles an unflashed device", () => {
    const nodemcu = mockNodeMcu()
    const mockDev = mockDevice()
    mockDev.path = '/dev/ttyUSB0'
    nodemcu.setListDevices([mockDev])

    const connector = new NodeMcuConnector(nodemcu)

    return connector.getDevice().then(device => {
      expect(device.path).toEqual("/dev/ttyUSB0")
      expect(device.chipId).toBeUndefined()
      expect(device.tallySettings).toBeUndefined()
      expect(device.errorMessage).toBeDefined()
    })
  })
})