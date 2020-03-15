-- buffer logs so they can be send to the hub
local maxBufferLength = 10
local buffer = {}

local createLog = function(severity)
    return function(msg)
        print(string.format("%-7s %s", "[" .. severity .. "]", msg))
        if MyTally and MyTally.isReady() then
            MyTally:sendLog(severity, msg)
        else
            if #buffer >= maxBufferLength then
                table.remove(buffer, 1)
            end
            table.insert(buffer, {severity, msg})
        end
    end
end

tmr.create():alarm(50, tmr.ALARM_AUTO, function()
    if #buffer > 0 and MyTally and MyTally.isConnected() and MyWifi and MyWifi.isConnected() then
        local record = buffer[1]
        table.remove(buffer, 1)
        local severity = record[1]
        local msg = record[2]
        MyTally:sendLog(severity, msg)
    end
end)

_G.MyLog = {
    info = createLog("INFO"),
    warning = createLog("WARN"),
    error = createLog("ERROR"),
}