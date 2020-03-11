local fileName = "/FLASH/tally-settings.ini"

-- defaults
local staSsid = nil
local staPw = nil
local hubIp = nil
local hubPort = 7411
local name = string.format("%x", node.chipid())

local trim = function(s)
    return s:match("^%s*(.-)%s*$")
end

_G.MySettings = {
    staSsid = function()
        return staSsid
    end,
    staPw = function()
        return staPw
    end,
    hubIp = function()
        return hubIp
    end,
    hubPort = function()
        return hubPort
    end,
    name = function()
        return name
    end,
}

if file.exists(fileName) then
    local f = file.open(fileName, "r")
    if not f then
        MyLog.error("Could not open settings file " .. fileName .. " to read configuration")
    else
        while true do
            local line = f:readline()
            if line then
                local k, v = line:match("^%s*([^=]+)%s*=%s*([^=]+)%s*$")
                if k ~= nil and v ~= nil and line:sub(1,1) ~= ";" then
                    k = trim(k) -- trim
                    v = trim(v) -- trim
                    if k == "station.ssid" then
                        staSsid = v
                    elseif k == "station.password" then
                        staPw = v
                    elseif k == "hub.ip" then
                        hubIp = v
                    elseif k == "hub.port" then
                        hubPort = tonumber(v)
                    elseif k == "tally.name" then
                        name = v
                    else
                        MyLog.warning("Unknown key " .. k .. " in configuration file. Did you mistype it?")
                    end
                end
            else
                break
            end
        end
        f:close()
    end
else
    MyLog.warning("Configuration file " .. fileName .. " does not exist. Using defaults.")
end
