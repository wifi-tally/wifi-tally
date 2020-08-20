_G.node = {
    chipid = function() return 12345678 end
}

_G.file = {
    exists = function() return true end,
    open = function()
        return {
            readline = function(_) return nil end,
            close = function() end,
        }
    end,
}

_G.now = 0 -- current simulated time in seconds

-- tracks the value of the pin by elapsed time
-- a value of 0 means LOW, 1 means HIGH and everything in between indicates the duty cycle of pwm
_G.pinByTime ={
    data = {},
    set = function(self, pin, value)
        local time = _G.now
        if time - math.floor(time) >= 0.5 then
            time = math.ceil(time)
        else
            time = math.floor(time)
        end

        self.data[pin] = self.data[pin] or {}
        self.data[pin][time] = value
    end,
    get = function(self, pin, time)
        local closestTime
        local value
        for theTime, theValue in pairs(self.data[pin]) do
            if theTime <= time and (closestTime == nil or closestTime < theTime) then
                closestTime = theTime
                value = theValue
            end
        end
        return value
    end,
    print = function(self, pin)
        for k,v in pairs(self.data[pin]) do
            print(k, v)
        end
    end,
}

_G.gpio = {
    OUTPUT = "output",
    HIGH = 1,
    LOW = 0,
    modeByPin = {},
    mode = function(pin, mode)
        if mode ~= _G.gpio.OUTPUT then
            error("Only gpio as output pins are supported by the mock.")
        end
        _G.gpio.modeByPin[pin] = mode
    end,
    write = function(pin, level)
        _G.pinByTime:set(pin, level)
    end
}
_G.pwm2 = {
    start = function() end,
    pulsePeriodByPin = {},
    setup_pin_hz = function(pin, freqAsHz, pulsePeriod, initialDuty)
        if (freqAsHz < 100) then
            error("frequencies lower as 100Hz are not supported by the mock. We just assume pwm is used to dim LEDs")
        end
        _G.pwm2.pulsePeriodByPin[pin] = pulsePeriod
        _G.pinByTime:set(pin, initialDuty / pulsePeriod)
    end,
    set_duty = function(pin, duty)
        if _G.pwm2.pulsePeriodByPin[pin] == nil then
            error("Pin " .. pin .. " has not been set up for pwm")
        end
        _G.pinByTime:set(pin, duty / _G.pwm2.pulsePeriodByPin[pin])
    end
}
_G.tmr = {
    ALARM_AUTO = "auto",
    create = function()
        local maxSimTime = 3000 -- abort the mock simulation after this many seconds
        local timerActive = false
        return {
            unregister = function()
                timerActive = false
            end,
            alarm = function(self, delay, type, func)
                timerActive = true
                if type ~= _G.tmr.ALARM_AUTO then
                    error("only type ALARM_AUTO is supported by the mock.")
                end

                _G.now = 0
                while timerActive and _G.now <= maxSimTime do
                    _G.now = _G.now + delay
                    func()
                end
                timerActive = false
                _G.now = 0
            end
        }
    end
}