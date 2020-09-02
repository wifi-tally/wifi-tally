-- pins used for the operators light
local pinOpG, pinOpR, pinOpB = 1, 2, 3

-- pins used for the main light
local pinMainG, pinMainR, pinMainB = 5, 6, 7

-- the pin that is sometimes connected to an LED on the board (e.g. NodeMCU LUA Amica)
local pinOnBoard = 0
-- initialize portpin as GPIO output
if pinOnBoard ~= nil then gpio.mode(pinOnBoard, gpio.OUTPUT) end

-- uses pin D4 for WS2812b (aka Neopixel) LED Strips
ws2812.init(ws2812.MODE_SINGLE)

-- the timer used for the status LED that signalizes network errors
local timer = tmr.create()

-- initialize portpins as pwm output, with 1kHz freq, 100 steps per period, initial duty cycle of 100
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
    -- showOnMain is true, if color is not BLUE
    if showOnMain == nil then showOnMain = color ~= colors.BLUE end

    -- seconds is at least 1s
    seconds = seconds or 1
    -- 
    local id = nextId
    nextId = nextId + 1

    local len = string.len(pattern)
    local idx = -1
    -- set duty cycle of next character
    local next = function()
        -- determine position of next character
        idx = (idx + 1) % len
        -- get current character from pattern string
        local state = pattern:sub(idx+1, idx+1)
        local darkness
        -- interpret character to a duty cycle value
        if state == " " then
            darkness = 100
        elseif state == "." then
            darkness = 99
        elseif state == "o" then
            darkness = 70
        elseif state == "O" then
            darkness = 0
        end

        --
        -- DRIVE THE OPERATOR LIGHT
        --
        local operatorDuty = darkness
        local operatorOff = 100
        -- if active high mode, then invert pwm signal
        if MySettings.operatorType() == LightTypes.COMMON_CATHODE then
            operatorDuty = 100 - darkness
            operatorOff = 0
        end
        -- set duty cycle of each portpin
        -- if color == true then duty = operatorDuty, else duty = operatorOff
        pwm2.set_duty(pinOpR, colorR and operatorDuty or operatorOff)
        pwm2.set_duty(pinOpG, colorG and operatorDuty or operatorOff)
        pwm2.set_duty(pinOpB, colorB and operatorDuty or operatorOff)

        --
        -- DRIVE THE STAGE LIGHT
        --
        local stageDuty = darkness
        local stageOff = 100
        -- if active high mode, then invert pwm signal
        if MySettings.stageType() == LightTypes.COMMON_CATHODE then
            stageDuty = 100 - darkness
            stageOff = 0
        end
        -- set duty cycle of each portpin
        -- if color == true then duty = operatorDuty, else duty = operatorOff
        pwm2.set_duty(pinMainR, colorR and showOnMain and stageDuty or stageOff)
        pwm2.set_duty(pinMainG, colorG and showOnMain and stageDuty or stageOff)
        pwm2.set_duty(pinMainB, colorB and showOnMain and stageDuty or stageOff)

        --
        -- DRIVE THE WS2812 STRIP
        --
        if MySettings.operatorNumberOfWs2812Lights() + MySettings.stageNumberOfWs2812Lights() > 0 then
            -- the API uses chars to represent brightness
            local data = ""
            for _=1,MySettings.operatorNumberOfWs2812Lights() do
                data = data ..
                string.char(math.ceil(colorG and (100 - darkness)*2.55 or 0)) ..
                string.char(math.ceil(colorR and (100 - darkness)*2.55 or 0)) ..
                string.char(math.ceil(colorB and (100 - darkness)*2.55 or 0))
            end
            for _=1,MySettings.stageNumberOfWs2812Lights() do
                data = data ..
                string.char(math.ceil(colorG and showOnMain and (100 - darkness)*2.55 or 0)) ..
                string.char(math.ceil(colorR and showOnMain and (100 - darkness)*2.55 or 0)) ..
                string.char(math.ceil(colorB and showOnMain and (100 - darkness)*2.55 or 0))
            end
            ws2812.write(data)
        end

        --
        -- DRIVE THE ONBOARD LED
        --
        -- pwm2 does not support to drive pin D0, so we try to emulate the flashPattern as good as possible without PWM
        if colorB and darkness > 0 then
            -- LED off
            -- only turn LED off if a flash pattern in blue color expects it to be off
            -- this causes the LED to be on by default

            -- with common anode HIGH means OFF
            gpio.write(pinOnBoard, gpio.HIGH)
        else
            -- LED on
            gpio.write(pinOnBoard, gpio.LOW)
        end
    end

    -- jumps to next character if timer is elapsed
    return function()
        -- if it is a new character, then restart the timer
        if currentId ~= id then
            currentId = id
            -- stops timer and unregisters the callback function
            timer:unregister()
            -- sets duty cycle of next character
            next()
            -- starts automatic repeating timer with time in ms and registers callback function
            timer:alarm(1000 * seconds / len, tmr.ALARM_AUTO, next)
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
