insulate("myHandleReceive", function()
    require "spec.nodemcu-mock"
    require "src.my-tally"
    require "src.my-settings"

    local currentOpR, currentOpG, currentOpB, currentStR, currentStG, currentStB, currentPattern, currentStepDuration
    _G.MyLed = {
        static = function(operatorR, operatorG, operatorB, stageR, stageG, stageB)
            currentOpR = operatorR
            currentOpG = operatorG
            currentOpB = operatorB
            currentStR = stageR
            currentStG = stageG
            currentStB = stageB
            currentPattern = nil
            currentStepDuration = nil
        end,
        flash = function(operatorR, operatorG, operatorB, stageR, stageG, stageB, pattern, stepDuration)
            currentOpR = operatorR
            currentOpG = operatorG
            currentOpB = operatorB
            currentStR = stageR
            currentStG = stageG
            currentStB = stageB
            currentPattern = pattern
            currentStepDuration = stepDuration
        end,
    }

    local realIt = it
    it = function(name, func)
        insulate(function()
            realIt(name, func)
        end)
    end

    it("parse a package with BLACK", function()
        myHandleReceive("O000/000/000 S000/000/000")
        assert.is_same({0, 0, 0}, {currentOpR, currentOpG, currentOpB})
        assert.is_same({0, 0, 0}, {currentStR, currentStG, currentStB})
        assert.is_nil(currentPattern)
        assert.is_nil(currentStepDuration)
    end)
    it("parses a package with strange colors", function()
        myHandleReceive("O010/020/030 S040/050/060")
        assert.is_same({10, 20, 30}, {currentOpR, currentOpG, currentOpB})
        assert.is_same({40, 50, 60}, {currentStR, currentStG, currentStB})
        assert.is_nil(currentPattern)
        assert.is_nil(currentStepDuration)
    end)
    it("parses a package with strange colors and a flash pattern", function()
        myHandleReceive("O010/020/030 S040/050/060 0xAA 300")
        assert.is_same({10, 20, 30}, {currentOpR, currentOpG, currentOpB})
        assert.is_same({40, 50, 60}, {currentStR, currentStG, currentStB})
        assert.is_same({true, false, true, false, true, false, true, false}, currentPattern)
        assert.is_same(300, currentStepDuration)
    end)
    it("parses a quick flash pattern", function()
        myHandleReceive("O255/255/255 S255/255/255 0x80 300")
        assert.is_same({true, false, false, false, false, false, false, false}, currentPattern)
        assert.is_same(300, currentStepDuration)
    end)
    it("should log a warning on too long package", function()
        local warnings = {}
        _G.MyLog = {
            warning = function(warning) table.insert(warnings, warning) end,
            getWarnings = function() return warnings end,
        }
        myHandleReceive("this is a very much too long message")
        assert.is_same(1, #warnings)
    end)
    it("should log a warning on too short package", function()
        local warnings = {}
        _G.MyLog = {
            warning = function(warning) table.insert(warnings, warning) end,
            getWarnings = function() return warnings end,
        }
        myHandleReceive("shrt")
        assert.is_same(1, #warnings)
    end)
end)