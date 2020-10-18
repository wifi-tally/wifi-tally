--- kind of the main function that wires everything together
--- and does error handling

wifi.setmode(wifi.NULLMODE)

require('my-log')
require('my-settings')
require('my-led')
require('my-tally')
require('my-wifi')

-- turn on the onboard LED to signal that some program is running
local pin = 0
gpio.mode(pin, gpio.OUTPUT)
gpio.write(pin, gpio.LOW)

-- log the boot reason
local bootreasons = {
    POWER_ON = 0,
    HW_WATCHDOG_RESET = 1,
    EXCEPTION_RESET = 2,
    SW_WATCHDOG_RESET = 3,
    SOFTWARE_RESTART = 4,
    WAKE_FROM_DEEP_SLEEP = 5,
    EXTERNAL_RESET = 6,
}

local _, bootreason, exccause, epc1, epc2, epc3, excvaddr, depc = node.bootreason()
local humanReadable = bootreason
for key, val in pairs(bootreasons) do
    if val == bootreason then
        humanReadable = key
        break
    end
end

local fn = MyLog.info
if bootreason == bootreasons.HW_WATCHDOG_RESET or bootreason == bootreasons.SW_WATCHDOG_RESET then
    fn = MyLog.error
end

fn("booted because of " .. humanReadable)

-- log more error reports in case an exception caused the tally to reboot
for _, thing in pairs({exccause, epc1, epc2, epc3, excvaddr, depc}) do
    if type(thing) == "string" then
        MyLog.error(thing)
    end
end

-- check that the configuration is fine and start the Wifi
if not MySettings.isValid() then
    MyLed.invalidSettingsFile()
else
    MyLed.initial()
    MyWifi.connect()
end
