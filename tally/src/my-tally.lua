--- everything that handles the connection to the Hub,
--- send and receive messages

local diffMicroSeconds = function(time)
    local now = tmr.now()
    if now < time then return now + (2^32 - time) else return now - time end
end

local listenPort = 7411

local listenSocket = nil

local timeLastPackageReceived = nil

local splitMessage = function(data)
    data = data:match("^%s*(.-)%s*$") -- trim

    local command
    local args = {}
    while true do
        local idx = data:find(" ")
        local fragment
        if idx == 0 then
            -- it is a leading space
            fragment = ""
            data = data:sub(2)
        elseif idx == nil then
            fragment = data
            data = ""
        else
            fragment = data:sub(1, idx-1)
            data = data:sub(idx+1)
        end
        if fragment ~= "" then
            if command == nil then
                command = fragment
            else
                local idx = fragment:find("=")

                if idx == nil then
                    -- found an argument without "=" - this is invalid
                    return
                else
                    local key = fragment:sub(1,idx-1)
                    local value = fragment:sub(idx+1)
                    args[key] = value
                end
            end
        end
        if data == "" then
            return command, args
        end
    end
end

_G.myHandleReceive = function(data)
    timeLastPackageReceived = tmr.now()
    local command, args = splitMessage(data)
    if command == "preview" then
        MyLed.onPreview()
    elseif command == "on-air" then
        MyLed.onAir()
    elseif command == "release" then
        MyLed.onRelease()
    elseif command == "highlight" then
        MyLed.onHighlight()
    elseif command == "unknown" then
        MyLed.onUnknown()
    else
        MyLog.warning("ignoring unknown package: " .. data)
        return
    end
    if args and args.sb then MySettings.setStageBrightness(args.sb) end
    if args and args.ob then MySettings.setOperatorBrightness(args.ob) end
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
