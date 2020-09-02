-- returns elapsed time in ms from timestamp
local diffMicroSeconds = function(time)
    local now = tmr.now()
    if now < time then return now + (2^32 - time) else return now - time end
end

local listenPort = 7411

local listenSocket = nil

local timeLastPackageReceived = nil

-- processes received data from hub and calls MyLed to display status
local handleReceive = function(data)
    -- timestamp from last received data
    timeLastPackageReceived = tmr.now()
    data = data:match("^%s*(.-)%s*$") -- trim
    if data == "preview" then
        MyLed.onPreview()
    elseif data == "on-air" then
        MyLed.onAir()
    elseif data == "release" then
        MyLed.onRelease()
    elseif data == "highlight" then
        MyLed.onHighlight()
    elseif data == "unknown" then
        MyLed.onUnknown()
    else
        MyLog.warning("ignoring unknown package: " .. data)
    end
end

_G.MyTally = {
    -- connects tally to the hub
    connect = function(self)
        if listenSocket == nil then
            listenSocket = net.createUDPSocket()
            listenSocket:on("receive", function(sck, c, port, ip)
                handleReceive(c)
            end)
            listenSocket:listen(listenPort)
        end
        MyLog.info(string.format("Listening for hub on port %d", listenPort))
        MyLog.info(string.format("Contacting hub on %s:%d", MySettings:hubIp(), MySettings:hubPort()))
        self:sendInfo()
    end,
    -- returns tally -> wifi connection status
    isReady = function()
        return MyWifi.isConnected() and listenSocket ~= nil
    end,
    -- returns tally -> hub connection status
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
    -- returns tally name
    sendInfo = function(self)
        self:send(string.format('tally-ho "%s"', MySettings:name()))
    end,
    -- returns Log message
    sendLog = function(self, severity, msg)
        self:send(string.format('log "%s" %s "%s"', MySettings:name(), severity, msg))
    end,
}

-- this timer maintains the connection to the hub
tmr.create():alarm(1000, tmr.ALARM_AUTO, function()
    -- check if Wifi is connected
    if MyWifi ~= nil and MyWifi.isConnected() then
        -- check if we seemed to have lost connection to the hub
        if not MyTally:isConnected() then
            -- display status on LED 
            MyLed.waitForServerConnection()
        end

        -- send probes to show the base station that we are still there
        if MyTally:isReady() then MyTally:sendInfo() end
    end
end)
