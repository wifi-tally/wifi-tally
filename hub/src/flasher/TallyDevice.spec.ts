import TallyDevice from './TallyDevice'
import TallySettingsIni from './TallySettingsIni'


test('toJson/fromJson', () => {
  const tallySettings = new TallySettingsIni("example=foo\n")
  const device = new TallyDevice()
  device.chipId = "abcd12"
  device.errorMessage = "error message"
  device.flashId = "1234ab"
  device.nodeMcuModules = "foo,bar,baz"
  device.nodeMcuVersion = "3.0.0"
  device.path = "/dev/ttyUSB0"
  device.productId = "123abc"
  device.tallySettings = tallySettings
  device.vendorId = "abc123"

  const json = device.toJson()
  const object = TallyDevice.fromJson(json)

  expect(object.chipId).toEqual("abcd12")
  expect(object.errorMessage).toEqual("error message")
  expect(object.flashId).toEqual("1234ab")
  expect(object.nodeMcuModules).toEqual("foo,bar,baz")
  expect(object.nodeMcuVersion).toEqual("3.0.0")
  expect(object.path).toEqual("/dev/ttyUSB0")
  expect(object.productId).toEqual("123abc")
  expect(object.tallySettings.toString()).toEqual("example=foo\n")
  expect(object.vendorId).toEqual("abc123")
})
