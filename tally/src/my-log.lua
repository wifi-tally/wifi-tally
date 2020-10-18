--- everything related to logging.
--- logs to the terminal if the Tally is connected via USB and via network if a connection was established

local buffer = require('my-log-buffer')

local createLog = function(severity)
    return function(msg)
        -- log to terminal
        print(string.format("%-7s %s", "[" .. severity .. "]", msg))

        -- log to Hub if connection is established
        if MyTally and MyTally.isReady() and not buffer:hasLog() then
            MyTally:sendLog(severity, msg)
        else
            buffer:addLog(severity, msg)
        end
    end
end

-- make sure that buffered logs are sent out once the tally is connected
tmr.create():alarm(50, tmr.ALARM_AUTO, function()
    if buffer:hasLog() and MyTally and MyTally.isReady() and MyTally.isConnected() and MyWifi and MyWifi.isConnected() then
        local severity, msg = buffer:getLog()
        MyTally:sendLog(severity, msg)
    end
end)

--- namespace for everything that logs stuff
_G.MyLog = {
    --- log an info.
    --- It might help debug issues, but is considered normal behavior.
    info = createLog(buffer.INFO),
    --- log a warning.
    --- Something looks out of the ordinary, but is not a problem in itself.
    warning = createLog(buffer.WARN),
    --- log an error.
    --- Something went obviously wrong.
    error = createLog(buffer.ERROR),
}