-- pins used for the operators light
local pinOpG, pinOpR, pinOpB = 7, 6, 5

-- pins used for the main light
local pinMainG, pinMainR, pinMainB = 4, 3, 2

-- the timer used for the status LED that signalizes network errors
local timer = tmr.create()

pwm2.setup_pin_hz(pinOpR, 1000, 100, 100)
pwm2.setup_pin_hz(pinOpG, 1000, 100, 100)
pwm2.setup_pin_hz(pinOpB, 1000, 100, 100)
pwm2.setup_pin_hz(pinMainR, 1000, 100, 100)
pwm2.setup_pin_hz(pinMainG, 1000, 100, 100)
pwm2.setup_pin_hz(pinMainB, 1000, 100, 100)
pwm2.start()

local colors = {
    RED = {true, false, false},
    GREEN = {false, true, false},
    BLUE = {false, false, true},
    WHITE = {true, true, true},
    BLACK = {false, false, false},
}

local nextId = 0
local currentId = nil

local flashPattern = function(pattern, color, seconds)
    local colorR, colorG, colorB = color[1], color[2], color[3]
    local showOnMain = color ~= colors.BLUE

    seconds = seconds or 1
    local id = nextId
    nextId = nextId + 1

    local len = string.len(pattern)
    local idx = -1
    local next = function()
        idx = (idx + 1) % len
        local isOn = pattern:sub(idx+1, idx+1) ~= " "

        if isOn then
            pwm2.set_duty(pinOpR, colorR and 0 or 100)
            pwm2.set_duty(pinOpG, colorG and 0 or 100)
            pwm2.set_duty(pinOpB, colorB and 0 or 100)
            pwm2.set_duty(pinMainR, colorR and showOnMain and 0 or 100)
            pwm2.set_duty(pinMainG, colorG and showOnMain and 0 or 100)
            pwm2.set_duty(pinMainB, colorB and showOnMain and 0 or 100)
        else
            pwm2.set_duty(pinOpR, colorR and 70 or 100)
            pwm2.set_duty(pinOpG, colorG and 70 or 100)
            pwm2.set_duty(pinOpB, colorB and 70 or 100)
            pwm2.set_duty(pinMainR, colorR and showOnMain and 70 or 100)
            pwm2.set_duty(pinMainG, colorG and showOnMain and 70 or 100)
            pwm2.set_duty(pinMainB, colorB and showOnMain and 70 or 100)
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
    initial = flashPattern("O", colors.BLUE),
    waitForWifiConnection = flashPattern("O ", colors.BLUE),
    waitForWifiIp = flashPattern("O O ", colors.BLUE),
    waitForServerConnection = flashPattern("O O   ", colors.BLUE),
    onPreview = flashPattern("O", colors.GREEN),
    onAir = flashPattern("O", colors.RED),
    onRelease = flashPattern("O", colors.BLACK),
    onUnknown = flashPattern("O       ", colors.BLUE, 2),
    onHighlight = flashPattern("O O O O ", colors.WHITE),
}