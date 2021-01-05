--- everything that handles the connection to the Hub,
--- send and receive messages

local diffMicroSeconds = function(time)
    local now = tmr.now()
    if now < time then return now + (2^32 - time) else return now - time end
end

local listenPort = 7411

local listenSocket = nil

local timeLastPackageReceived = nil

local parseMessage = function(data)
    data = data:match("^%s*(.-)%s*$") -- trim
    local len = string.len(data)
    if len ~= 25 and len ~=34 then
        return
    end
    if data:sub(1, 1) ~= "O" or data:sub(5,5) ~= "/" or data:sub(9,9) ~= "/" or data:sub(13,14) ~= " S" or data:sub(18,18) ~= "/" or data:sub(22,22) ~= "/" then
        return
    end
    local opR = tonumber(data:sub(2, 4), 10)
    local opG = tonumber(data:sub(6, 8), 10)
    local opB = tonumber(data:sub(10, 12), 10)
    local stR = tonumber(data:sub(15, 17), 10)
    local stG = tonumber(data:sub(19, 21), 10)
    local stB = tonumber(data:sub(23, 25), 10)
    local pattern
    local duration
    if len == 34 then
        if data:sub(26,28) ~= " 0x" or data:sub(31, 31) ~= " " then return end
        local patternNumber = tonumber(data:sub(29, 30), 16)
        pattern = {}
        -- @TODO: Lua 5.3 comes with bit operators, but 5.1 does not yet
        for _, num in pairs({128,64,32,16,8,4,2,1}) do
            if patternNumber >= num then
                patternNumber = patternNumber - num
                table.insert(pattern, true)
            else
                table.insert(pattern, false)
            end
        end
        duration = tonumber(data:sub(32, 34), 10)
    end
    return opR, opG, opB, stR, stG, stB, pattern, duration
end

_G.myHandleReceive = function(data)
    timeLastPackageReceived = tmr.now()
    local opR, opG, opB, stR, stG, stB, pattern, duration = parseMessage(data)
    if not opR then
        MyLog.warning(string.format('invalid package: %s', data))
        return
    end
    if pattern ~= nil and duration ~= nil then
        MyLed.flash(opR, opG, opB, stR, stG, stB, pattern, duration)
    else
        -- a static color
        MyLed.static(opR, opG, opB, stR, stG, stB)
    end
end

_G.MyTally = {
    connect = function(self)
        if listenSocket == nil then
            listenSocket = net.createUDPSocket()
            listenSocket:on("receive", function(sck, c, port, ip)
                myHandleReceive(c)
            end)
            listenSocket:listen(listenPort)
        end
        MyLog.info(string.format("Listening for hub on port %d", listenPort))
        MyLog.info(string.format("Contacting hub on %s:%d", MySettings:hubIp(), MySettings:hubPort()))
        self:sendInfo()
    end,
    isReady = function()
        return MyWifi.isConnected() and listenSocket ~= nil
    end,
    isConnected = function()
        return timeLastPackageReceived ~= nil and diffMicroSeconds(timeLastPackageReceived) <= 3000000
    end,
    send = function(_, data)
        if not MyWifi.isConnected() then
            MyLog.error("Not sending packet, because wifi is not connected.")
            return
        elseif listenSocket == nil then
            MyLog.error("Not sending packet, because UDP is not set up yet.")
            return
        end
        listenSocket:send(MySettings:hubPort(), MySettings:hubIp(), data .. "\n")
    end,
    sendInfo = function(self)
        self:send(string.format('tally-ho "%s"', MySettings:name()))
    end,
    sendLog = function(self, severity, msg)
        self:send(string.format('log "%s" %s "%s"', MySettings:name(), severity, msg))
    end,
}

tmr.create():alarm(1000, tmr.ALARM_AUTO, function()
    if MyWifi ~= nil and MyWifi.isConnected() then
        -- check if we seemed to have lost connection to the base station
        if not MyTally:isConnected() then
            MyLed.waitForServerConnection()
        end

        -- send probes to show the base station that we are still there
        if MyTally:isReady() then MyTally:sendInfo() end
    end
end)
