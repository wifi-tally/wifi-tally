_G.MyWifi = {
    connect = function()
        MyLed.waitForWifiConnection()
        MyLog.info("Trying to connect to " .. MySettings:staSsid())
        wifi.setmode(wifi.STATION)
        wifi.sta.config({
            ssid = MySettings:staSsid(),
            --ssid = "error",
            pwd = MySettings:staPw(),
            auto = false,
            save = false,
        })
        wifi.sta.sethostname("Tally-" .. MySettings:name())
        wifi.sta.connect()
    end,
    disconnect = function()
        wifi.sta.disconnect()
    end,
    isConnected = function()
        -- wifi.sta.status() returns wifi.STA_GOTIP even when the tally was thrown out of wifi -> so it's no good choice
        return isConnected
    end,
    getIp = function()
        return wifi.sta.getip()
    end,
    getMac = function()
        return wifi.sta.getmac()
    end,
}

wifi.setmaxtxpower(82)

wifi.eventmon.register(wifi.eventmon.STA_CONNECTED, function(T)
    isConnected = false
    MyLog.info("Connected to " .. T.SSID .. ". Waiting for IP.")

    MyLed.waitForWifiIp()
end)

wifi.eventmon.register(wifi.eventmon.STA_DISCONNECTED, function(T)
    isConnected = false

    local humanReadable = T.reason
    for key, val in pairs(wifi.eventmon.reason) do
        if val == T.reason then
            humanReadable = key
            break
        end
    end

    MyLog.error("Got disconnected from " ..T.SSID .. ". Reason " .. humanReadable)

    MyLed.initial()
    local delay = 2000
    if T.reason == wifi.eventmon.reason.AUTH_EXPIRE then delay = 200 end
    tmr.create():alarm(delay, tmr.ALARM_SINGLE, MyWifi.connect)
end)

wifi.eventmon.register(wifi.eventmon.STA_GOT_IP, function(T)
    MyLog.info("Got IP " .. T.IP)

    isConnected = true
    MyLed.waitForServerConnection()
    MyTally:connect()
end)

wifi.eventmon.register(wifi.eventmon.STA_DHCP_TIMEOUT, function()

    isConnected = false
    MyLog.error("DHCP timeout")

    MyLed.initial()
    MyWifi.disconnect()
    tmr.create():alarm(200, tmr.ALARM_SINGLE, MyWifi.connect)
end)
