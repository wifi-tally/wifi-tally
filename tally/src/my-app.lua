wifi.setmode(wifi.NULLMODE)

require('my-log')
require('my-settings')
require('my-led')
require('my-tally')
require('my-wifi')

MyLed.initial()
MyWifi.connect()
