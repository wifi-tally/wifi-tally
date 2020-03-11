local pinG, pinR, pinB = 7, 6, 5

-- the timer used for the status LED that signalizes network errors
local timer = tmr.create()

pwm2.setup_pin_hz(pinR, 1000, 100, 0)
pwm2.setup_pin_hz(pinG, 1000, 100, 0)
pwm2.setup_pin_hz(pinB, 1000, 100, 0)
pwm2.start()

local nextId = 0
local currentId = nil

local flashPattern = function(pattern, colorR, colorG, colorB, seconds)
    seconds = seconds or 1
    local id = nextId
    nextId = nextId + 1

    local len = string.len(pattern)
    local idx = -1
    local next = function()
        idx = (idx + 1) % len
        local isOn = pattern:sub(idx+1, idx+1) ~= " "

        if isOn then
            pwm2.set_duty(pinR, colorR and 0 or 100)
            pwm2.set_duty(pinG, colorG and 0 or 100)
            pwm2.set_duty(pinB, colorB and 0 or 100)
        else
            pwm2.set_duty(pinR, colorR and 70 or 100)
            pwm2.set_duty(pinG, colorG and 70 or 100)
            pwm2.set_duty(pinB, colorB and 70 or 100)
        end
    end

    return function()
        if currentId ~= id then
            currentId = id
            timer:unregister()
            timer:alarm(1000 * seconds / len, tmr.ALARM_AUTO, next)
            next()
        end
    end
end

_G.MyLed = {
    -- signal that nothing is being done
    initial = flashPattern("O", false, false, true),
    waitForWifiConnection = flashPattern("O ", false, false, true),
    waitForWifiIp = flashPattern("O O ", false, false, true),
    waitForServerConnection = flashPattern("O O   ", false, false, true),
    onPreview = flashPattern("O", false, true, false),
    onAir = flashPattern("O", true, false, false),
    onRelease = flashPattern("O", false, false, false),
    onUnknown = flashPattern("O       ", false, false, true, 2),
    onHighlight = flashPattern("O O O O ", true, true, true),
    cp = flashPattern("O ", true, false, true),
    cpConnected = flashPattern("O", true, false, true),
}