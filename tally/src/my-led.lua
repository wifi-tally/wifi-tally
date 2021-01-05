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

--- sets up the color as the current color the Tally should display
--- @param operatorR number [0-255] the brightness of the RED LED for the operator  light
--- @param operatorG number [0-255] the brightness of the GREEN LED for the operator  light
--- @param operatorB number [0-255] the brightness of the BLUE LED for the operator light
--- @param stageR number [0-255] the brightness of the RED LED for the stage light
--- @param stageG number [0-255] the brightness of the GREEN LED for the stage light
--- @param stageB number [0-255] the brightness of the BLUE LED for the stage light
local showColor = function(operatorR, operatorG, operatorB, stageR, stageG, stageB)
    --
    -- DRIVE THE OPERATOR LIGHT
    --
    local operatorDutyR, operatorDutyG, operatorDutyB = operatorR / 255*100, operatorG / 255*100, operatorB / 255*100
    if MySettings.operatorType() == LightTypes.COMMON_ANODE then
        operatorDutyR, operatorDutyG, operatorDutyB = 100 - operatorDutyR, 100 - operatorDutyG, 100 - operatorDutyB
    end
    pwm2.set_duty(pinOpR, operatorDutyR)
    pwm2.set_duty(pinOpG, operatorDutyG)
    pwm2.set_duty(pinOpB, operatorDutyB)

    --
    -- DRIVE THE STAGE LIGHT
    --
    local stageDutyR, stageDutyG, stageDutyB = stageR / 255*100, stageG / 255*100, stageB / 255*100
    if MySettings.stageType() == LightTypes.COMMON_ANODE then
        stageDutyR, stageDutyG, stageDutyB = 100 - stageDutyR, 100 - stageDutyG, 100 - stageDutyB
    end
    pwm2.set_duty(pinMainR, stageDutyR)
    pwm2.set_duty(pinMainG, stageDutyG)
    pwm2.set_duty(pinMainB, stageDutyB)

    --
    -- DRIVE THE WS2812 STRIP
    --
    if MySettings.operatorNumberOfWs2812Lights() + MySettings.stageNumberOfWs2812Lights() > 0 then
        -- the API uses chars to represent brightness
        local data = ""
        for _=1,MySettings.operatorNumberOfWs2812Lights() do
            data = data ..
                string.char(operatorG) ..
                string.char(operatorR) ..
                string.char(operatorB)
        end
        for _=1,MySettings.stageNumberOfWs2812Lights() do
            data = data ..
                string.char(stageG) ..
                string.char(stageR) ..
                string.char(stageB)
        end
        ws2812.write(data)
    end

    --
    -- DRIVE THE ONBOARD LED
    --
    -- pwm2 does not support to drive pin D0, so we try to emulate the flashPattern as good as possible without PWM
    if (operatorR == 0 and operatorG == 0 and operatorB < 255) or (operatorR == operatorG and operatorG == operatorB and operatorB < 255) then
        -- only turn LED off if a flash pattern in blue color expects it to be off
        -- this causes the LED to be on by default

        -- with common anode HIGH means OFF
        gpio.write(pinOnBoard, gpio.HIGH)
    else
        gpio.write(pinOnBoard, gpio.LOW)
    end
end

local currentFlashHash = nil
--- makes the LEDs blink in a given pattern in the given color
--- @param operatorR number [0-255] the brightness of the RED LED for the operator  light
--- @param operatorG number [0-255] the brightness of the GREEN LED for the operator  light
--- @param operatorB number [0-255] the brightness of the BLUE LED for the operator light
--- @param stageR number [0-255] the brightness of the RED LED for the stage light
--- @param stageG number [0-255] the brightness of the GREEN LED for the stage light
--- @param stageB number [0-255] the brightness of the BLUE LED for the stage light
--- @param pattern boolean[] a table of booleans if the light should be bright (true) or dark (false) in this step
--- @param stepDuration number how long before the next step is shown (in ms)
local showFlashPattern = function(operatorR, operatorG, operatorB, stageR, stageG, stageB, pattern, stepDuration)
    local patternHash = ""
    for _, step in pairs(pattern) do
        patternHash = patternHash .. (step and "1" or "0")
    end
    local flashHash = string.format(
        "%d/%d/%d-%d/%d/%d-%s-%d",
        operatorR, operatorG, operatorB,
        stageR, stageG, stageB,
        patternHash,
        stepDuration
    )
    if flashHash == currentFlashHash then
        -- the same flash pattern is already running.
        -- should not be started again, because it will destroy the visual pattern
        return
    end
    currentFlashHash = flashHash

    local currentIdx = 1
    local maxIdx = #pattern
    local next = function()
        local isBright = pattern[currentIdx]
        if isBright then
            showColor(operatorR, operatorG, operatorB, stageR, stageG, stageB)
        else
            showColor(
                math.ceil(operatorR * 0.3), math.ceil(operatorG * 0.3), math.ceil(operatorB * 0.3),
                math.ceil(stageR * 0.3), math.ceil(stageG * 0.3), math.ceil(stageB * 0.3)
            )
        end

        currentIdx = currentIdx + 1
        if currentIdx > maxIdx then currentIdx = 1 end
    end
    timer:unregister()
    next()
    timer:alarm(stepDuration, tmr.ALARM_AUTO, next)
end

--- @param operatorR number [0-255] the brightness of the RED LED for the operator  light
--- @param operatorG number [0-255] the brightness of the GREEN LED for the operator  light
--- @param operatorB number [0-255] the brightness of the BLUE LED for the operator light
--- @param stageR number [0-255] the brightness of the RED LED for the stage light
--- @param stageG number [0-255] the brightness of the GREEN LED for the stage light
--- @param stageB number [0-255] the brightness of the BLUE LED for the stage light
local showStaticColor = function(operatorR, operatorG, operatorB, stageR, stageG, stageB)
    timer:unregister()
    currentFlashHash = nil
    showColor(operatorR, operatorG, operatorB, stageR, stageG, stageB)
end

local bright = true
local dim = false
--- namespace of everything that makes LEDs blink
_G.MyLed = {
    -- signal that nothing is being done
    initial = function()
        showStaticColor(0, 0, 255, 0, 0, 0)
    end,
    waitForWifiConnection = function()
        showFlashPattern(0, 0, 255, 0, 0, 0, {bright, dim}, 500)
    end,
    invalidSettingsFile = function()
        showFlashPattern(0, 0, 255, 0, 0, 0, {bright, dim, bright, dim, bright, dim, dim, dim, dim, dim, dim, dim}, 150)
    end,
    waitForWifiIp = function()
        showFlashPattern(0, 0, 255, 0, 0, 0, {bright, dim, bright, dim}, 250)
    end,
    waitForServerConnection = function()
        showFlashPattern(0, 0, 255, 0, 0, 0, {bright, dim, bright, dim, dim, dim}, 150)
    end,
    -- all other flash patterns are directly sent by the hub
    static = showStaticColor,
    flash = showFlashPattern,
}