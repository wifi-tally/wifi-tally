

insulate("myHandleReceive", function()
    require "spec.nodemcu-mock"
    require "src.my-tally"
    require "src.my-settings"

    local currentFlashPattern = "initial"
    _G.MyLed = {}
    setmetatable(_G.MyLed, {
        __index = function(self, funcName)
            return function() currentFlashPattern = funcName end
        end,
    })

    local realIt = it
    it = function(name, func)
        insulate(function()
            realIt(name, func)
        end)
    end

    it("should parse a plain PREVIEW command", function()
        myHandleReceive("preview")
        assert.is_same(currentFlashPattern, "onPreview")
    end)
    it("should parse a PREVIEW command with settings", function()
        myHandleReceive("preview sb=80 ob=50")
        assert.is_same(currentFlashPattern, "onPreview")
        assert.is_same(80, _G.MySettings.stageBrightness())
        assert.is_same(50, _G.MySettings.operatorBrightness())
    end)
    it("should parse a plain ON-AIR command", function()
        myHandleReceive("on-air")
        assert.is_same(currentFlashPattern, "onAir")
    end)
    it("should parse a ON-AIR command with settings", function()
        myHandleReceive("on-air sb=80 ob=50")
        assert.is_same(currentFlashPattern, "onAir")
        assert.is_same(80, _G.MySettings.stageBrightness())
        assert.is_same(50, _G.MySettings.operatorBrightness())
    end)
    it("should parse a plain RELEASE command", function()
        myHandleReceive("release")
        assert.is_same(currentFlashPattern, "onRelease")
    end)
    it("should parse a RELEASE command with settings", function()
        myHandleReceive("release sb=80 ob=50")
        assert.is_same(currentFlashPattern, "onRelease")
        assert.is_same(80, _G.MySettings.stageBrightness())
        assert.is_same(50, _G.MySettings.operatorBrightness())
    end)
    it("should parse a plain UNKNOWN command", function()
        myHandleReceive("unknown")
        assert.is_same(currentFlashPattern, "onUnknown")
    end)
    it("should parse a UNKNOWN command with settings", function()
        myHandleReceive("unknown sb=80 ob=50")
        assert.is_same(currentFlashPattern, "onUnknown")
        assert.is_same(80, _G.MySettings.stageBrightness())
        assert.is_same(50, _G.MySettings.operatorBrightness())
    end)
    it("should log a warning on unknown package", function()
        local warnings = {}
        _G.MyLog = {
            warning = function(warning) table.insert(warnings, warning) end,
            getWarnings = function() return warnings end,
        }
        myHandleReceive("this is an invalid message")
        assert.is_same(1, #warnings)
    end)
    it("ignores trailing new-lines", function()
        myHandleReceive("preview\n")
        assert.is_same(currentFlashPattern, "onPreview")
    end)
end)