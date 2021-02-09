import TallySettingsIni from './TallySettingsIni'



describe("parse()", () => {
  const defaultTallySettings = `station.ssid=MyWifi
  station.password=topsecret
  hub.ip=10.10.1.1
  hub.port=4242
  tally.name=Doe
  `.replace(/\n\s*/gi, "\n")

  const tallySettingsIni = new TallySettingsIni(defaultTallySettings)

  test('it reads SSID', () => {
    expect(tallySettingsIni.getStationSsid()).toEqual('MyWifi')
  })
  test('it reads password', () => {
    expect(tallySettingsIni.getStationPassword()).toEqual('topsecret')
  })
  test('it reads hub ip', () => {
    expect(tallySettingsIni.getHubIp()).toEqual('10.10.1.1')
  })
  test('it reads hub port', () => {
    expect(tallySettingsIni.getHubPort()).toEqual(4242)
  })
  test('it reads tally name', () => {
    expect(tallySettingsIni.getTallyName()).toEqual('Doe')
  })
})


test("it can read and change the SSID", () => {
  const initialTallySettings = `station.ssid=MyWifi
  station.password=topsecret
  hub.ip=10.10.1.1
  hub.port=4242
  tally.name=Doe
  `.replace(/\n\s*/gi, "\n")

  const tallySettingsIni = new TallySettingsIni(initialTallySettings)
  tallySettingsIni.setStationSsid("MyNewWifi")

  const output = tallySettingsIni.toString()

  const expectedTallySettings = `station.ssid=MyNewWifi
  station.password=topsecret
  hub.ip=10.10.1.1
  hub.port=4242
  tally.name=Doe
  `.replace(/\n\s*/gi, "\n")

  expect(output).toEqual(expectedTallySettings)
})

test("it can work with empty file", () => {
  const tallySettingsIni = new TallySettingsIni()
  tallySettingsIni.setStationSsid("MyWifi")
  tallySettingsIni.setStationPassword("topsecret")

  const output = tallySettingsIni.toString()
  const expectedTallySettings = `station.ssid=MyWifi
  station.password=topsecret
  `.replace(/\n\s*/gi, "\n")

  expect(output).toEqual(expectedTallySettings)
})

test("it replaces existing settings", () => {
  const tallySettingsIni = new TallySettingsIni()
  tallySettingsIni.setStationSsid("MyWifi")

  const output = tallySettingsIni.toString()
  const expectedTallySettings = `station.ssid=MyWifi\n`

  expect(output).toEqual(expectedTallySettings)

  tallySettingsIni.setStationSsid("MyNewWifi")

  const output2 = tallySettingsIni.toString()
  const expectedTallySettings2 = `station.ssid=MyNewWifi\n`

  expect(output2).toEqual(expectedTallySettings2)
})