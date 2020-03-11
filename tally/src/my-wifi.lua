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
        if wifi.getmode() == wifi.STATION then
            return wifi.sta.status() == wifi.STA_GOTIP
        elseif wifi.getmode() == wifi.SOFTAP then
            return true
        end
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
    MyLog.info("Connected to " .. T.SSID .. ". Waiting for IP.")
    MyLed.waitForWifiIp()
end)

wifi.eventmon.register(wifi.eventmon.STA_DISCONNECTED, function(T)
    MyLog.info("Got disconnected from " ..T.SSID .. ". Reason " .. T.reason)
    tmr.create():alarm(2000, tmr.ALARM_SINGLE, MyWifi.connect)
end)

wifi.eventmon.register(wifi.eventmon.STA_GOT_IP, function(T)
    MyLog.info("Got IP " .. T.IP)

    MyLed.waitForServerConnection()
    MyTally:connect()
end)

wifi.eventmon.register(wifi.eventmon.STA_DHCP_TIMEOUT, function()
    MyLog.error("DHCP timeout")

    MyWifi.disconnect()
    tmr.create():alarm(2000, tmr.ALARM_SINGLE, MyWifi.connect)
end)
