local fileName = "/FLASH/tally-settings.ini"

_G.LightTypes = {
    COMMON_ANODE = "grb+",
    COMMON_CATHODE = "grb-",
}

-- defaults
local staSsid = nil
local staPw = nil
local hubIp = nil
local hubPort = 7411
local name = string.format("%x", node.chipid())
local operatorType = LightTypes.COMMON_ANODE
local stageType = LightTypes.COMMON_ANODE

local trim = function(s)
    return s:match("^%s*(.-)%s*$")
end

local isValueInTable = function(value, table)
    for _, val in pairs(table) do
        if value == val then return true end
    end
    return false
end

local makeHostName = function(s)
    return "Tally-" .. s:gsub("[^%w]+", "-"):gsub("^\-+", ""):gsub("\-+$", "")
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
    hostName = function()
        return makeHostName(name)
    end,
    operatorType = function()
        return operatorType
    end,
    stageType = function()
        return stageType
    end,
    isValid = function()
        return staSsid ~= nil and hubIp ~= nil
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
                        name = v:sub(0, 26)
                    elseif k == "operator.type" then
                        local value = v:lower()
                        if isValueInTable(value, LightTypes) then
                            operatorType = value
                        else
                            MyLog.warning("Invalid operator.type \"" .. v .. "\"")
                        end
                    elseif k == "stage.type" then
                        local value = v:lower()
                        if isValueInTable(value, LightTypes) then
                            stageType = value
                        else
                            MyLog.warning("Invalid stage.type \"" .. v .. "\"")
                        end
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
