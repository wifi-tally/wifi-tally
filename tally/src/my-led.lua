--- everything related to making LEDs blink.
--- it serves as a library to everything else

-- pins used for the operators light
local pinOpG, pinOpR, pinOpB = 1, 2, 3

-- the pin that is sometimes connected to an LED on the board
local pinOnBoard = 0

-- pins used for the main light
local pinMainG, pinMainR, pinMainB = 5, 6, 7

gpio.mode(pinOnBoard, gpio.OUTPUT)

-- uses D4
ws2812.init(ws2812.MODE_SINGLE)

-- timer used to make LEDs flash on and off
local timer = tmr.create()

-- setup all the RGB pins as pwm pins
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

-- globally tracks an internal id of all configured flashing patterns
local nextId = 0

-- tracks which flashing pattern is currently shown. This way we can make sure to not start
-- a pattern again from the beginning if it was already running.
local currentId = nil

--- this is a Factory to setup flash patterns
--- It takes the parameters and returns a function that you can call if you want the according pattern to play
--- @param pattern string A string representing the expected brightness of the LED (so it easily human readable)
--- @param color table[3] a table of 3 boolean values if the RGB channels should be used
--- @param seconds number how many seconds the whole pattern should last
--- @param showOnMain boolean if this pattern should also be shown on the stage light
local flashPattern = function(pattern, color, seconds, showOnMain)
    local colorR, colorG, colorB = color[1], color[2], color[3]
    if showOnMain == nil then showOnMain = color ~= colors.BLUE end

    seconds = seconds or 1
    local id = nextId
    nextId = nextId + 1

    -- number of equal-duration segments in the pattern
    local len = string.len(pattern)

    -- the currently played segment in the pattern
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

        local opB = MySettings.operatorBrightness()
        -- math.floor prevents a light with darkness 99.5 to flip completely off
        local operatorDarkness = math.floor(opB / 100 * darkness + 100 - opB)
        local stB = MySettings.stageBrightness()
        local stageDarkness = math.floor(stB / 100 * darkness + 100 - stB)

        --
        -- DRIVE THE OPERATOR LIGHT
        --
        local operatorDuty = operatorDarkness
        local operatorOff = 100
        if MySettings.operatorType() == LightTypes.COMMON_CATHODE then
            operatorDuty = 100 - operatorDarkness
            operatorOff = 0
        end
        pwm2.set_duty(pinOpR, colorR and operatorDuty or operatorOff)
        pwm2.set_duty(pinOpG, colorG and operatorDuty or operatorOff)
        pwm2.set_duty(pinOpB, colorB and operatorDuty or operatorOff)

        --
        -- DRIVE THE STAGE LIGHT
        --
        local stageDuty = stageDarkness
        local stageOff = 100
        if MySettings.stageType() == LightTypes.COMMON_CATHODE then
            stageDuty = 100 - stageDarkness
            stageOff = 0
        end
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
                string.char(math.ceil(colorG and (100 - operatorDarkness)*2.55 or 0)) ..
                string.char(math.ceil(colorR and (100 - operatorDarkness)*2.55 or 0)) ..
                string.char(math.ceil(colorB and (100 - operatorDarkness)*2.55 or 0))
            end
            for _=1,MySettings.stageNumberOfWs2812Lights() do
                data = data ..
                string.char(math.ceil(colorG and showOnMain and (100 - stageDarkness)*2.55 or 0)) ..
                string.char(math.ceil(colorR and showOnMain and (100 - stageDarkness)*2.55 or 0)) ..
                string.char(math.ceil(colorB and showOnMain and (100 - stageDarkness)*2.55 or 0))
            end
            ws2812.write(data)
        end

        --
        -- DRIVE THE ONBOARD LED
        --
        -- pwm2 does not support to drive pin D0, so we try to emulate the flashPattern as good as possible without PWM
        if colorB and darkness > 0 then
            -- only turn LED off if a flash pattern in blue color expects it to be off
            -- this causes the LED to be on by default

            -- with common anode HIGH means OFF
            gpio.write(pinOnBoard, gpio.HIGH)
        else
            gpio.write(pinOnBoard, gpio.LOW)
        end
    end

    return function()
        if currentId ~= id then
            currentId = id
            timer:unregister()
            next()
            timer:alarm(1000 * seconds / len, tmr.ALARM_AUTO, next)
        end
    end
end

--- namespace of everything that makes LEDs blink
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