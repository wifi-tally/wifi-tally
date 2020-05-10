-- pins used for the operators light
local pinOpG, pinOpR, pinOpB = 2, 3, 4

-- pins used for the main light
local pinMainG, pinMainR, pinMainB = 5, 6, 7

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
    -- R, G, B
    RED = {true, false, false},
    GREEN = {false, true, false},
    BLUE = {false, false, true},
    WHITE = {true, true, true},
    BLACK = {false, false, false},
}

local nextId = 0
local currentId = nil

local flashPattern = function(pattern, color, seconds, showOnMain)
    local colorR, colorG, colorB = color[1], color[2], color[3]
    if showOnMain == nil then showOnMain = color ~= colors.BLUE end

    seconds = seconds or 1
    local id = nextId
    nextId = nextId + 1

    local len = string.len(pattern)
    local idx = -1
    local next = function()
        idx = (idx + 1) % len
        local state = pattern:sub(idx+1, idx+1)
        local darkness
        if state == " " then
            darkness = 100
        elseif state == "." then
            darkness = 99
        elseif state == "o" then
            darkness = 70
        elseif state == "O" then
            darkness = 0
        end

        pwm2.set_duty(pinOpR, colorR and darkness or 100)
        pwm2.set_duty(pinOpG, colorG and darkness or 100)
        pwm2.set_duty(pinOpB, colorB and darkness or 100)
        pwm2.set_duty(pinMainR, colorR and showOnMain and darkness or 100)
        pwm2.set_duty(pinMainG, colorG and showOnMain and darkness or 100)
        pwm2.set_duty(pinMainB, colorB and showOnMain and darkness or 100)
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
    waitForWifiConnection = flashPattern("Oo", colors.BLUE),
    invalidSettingsFile = flashPattern("OoOoOooooooo", colors.BLUE, 2),
    waitForWifiIp = flashPattern("OoOo", colors.BLUE),
    waitForServerConnection = flashPattern("OoOooo", colors.BLUE),
    onPreview = flashPattern("O", colors.GREEN),
    onAir = flashPattern("O", colors.RED),
    onRelease = flashPattern(".", colors.GREEN, nil, false),
    onUnknown = flashPattern("Oooooooo", colors.BLUE, 2),
    onHighlight = flashPattern("OoOoOoOo", colors.WHITE),
}