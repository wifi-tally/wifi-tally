local buffer = require('my-log-buffer')

local createLog = function(severity)
    return function(msg)
        print(string.format("%-7s %s", "[" .. severity .. "]", msg))
        if MyTally and MyTally.isReady() and not buffer:hasLog() then
            MyTally:sendLog(severity, msg)
        else
            buffer:addLog(severity, msg)
        end
    end
end

tmr.create():alarm(50, tmr.ALARM_AUTO, function()
    if buffer:hasLog() and MyTally and MyTally.isReady() and MyTally.isConnected() and MyWifi and MyWifi.isConnected() then
        local severity, msg = buffer:getLog()
        MyTally:sendLog(severity, msg)
    end
end)

_G.MyLog = {
    info = createLog(buffer.INFO),
    warning = createLog(buffer.WARN),
    error = createLog(buffer.ERROR),
}