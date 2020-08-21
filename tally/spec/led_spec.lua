local pinOpG, pinOpR, pinOpB = 1, 2, 3
local pinMainG, pinMainR, pinMainB = 5, 6, 7
local pinOnBoard = 0

describe("Led", function()
    insulate("initial()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
        MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
        MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock

        require "src.my-led"
        _G.MyLed.initial()

        it("should show a permanent blue on the operator light", function()
            for time=0,3000,100 do
                assert.is_same(1, _G.pinByTime:get(pinOpR, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinOpG, time), time .. "s")
                assert.is_same(0, _G.pinByTime:get(pinOpB, time), time .. "s")
            end
        end)
        it("should not show anything on the stage light", function()
            for time=0,3000,100 do
                assert.is_same(1, _G.pinByTime:get(pinMainR, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainG, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainB, time), time .. "s")
            end
        end)
        it("should show blue on the ws2128 strip", function()
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(0))
        end)
        it("should turn the on board light on", function()
            for time=0,3000,100 do
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, time), time .. "s")
            end
        end)
    end)
    insulate("waitForWifiConnection()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
        MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
        MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock

        require "src.my-led"
        _G.MyLed.waitForWifiConnection()

        it("should blink blue on the operator light", function()
            for time=0,3000,100 do
                assert.is_same(1, _G.pinByTime:get(pinOpR, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinOpG, time), time .. "s")
            end
            assert.is_same(0, _G.pinByTime:get(pinOpB, 0))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 100))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 200))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 300))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 400))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 500))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 600))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 700))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 800))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 900))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 1000))
        end)
        it("should not show anything on the stage light", function()
            for time=0,3000,100 do
                assert.is_same(1, _G.pinByTime:get(pinMainR, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainG, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainB, time), time .. "s")
            end
        end)
        it("should blink blue on the ws2128 strip", function()
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(0))
            assert.is_same({
                --g    r    b
                  0,   0, 77, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(500))
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(1000))
        end)
        it("should make the on board light blink", function()
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 0))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 100))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 200))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 300))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 400))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 500))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 600))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 700))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 800))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 900))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 1000))
        end)
    end)
    insulate("invalidSettingsFile()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
        MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
        MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock

        require "src.my-led"
        _G.MyLed.invalidSettingsFile()

        it("should blink blue on the operator light", function()
            for time=0,3000,100 do
                assert.is_same(1, _G.pinByTime:get(pinOpR, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinOpG, time), time .. "s")
            end
            assert.is_same(0, _G.pinByTime:get(pinOpB, 0))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 167))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 333))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 500))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 667))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 833))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 1000))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 1167))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 1333))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 1500))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 1667))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 1833))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 2000))

        end)
        it("should not show anything on the stage light", function()
            for time=0,3000,100 do
                assert.is_same(1, _G.pinByTime:get(pinMainR, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainG, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainB, time), time .. "s")
            end
        end)
        it("should blink blue on the ws2128 strip", function()
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(0))
            assert.is_same({
                --g    r    b
                  0,   0, 77, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(167))
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(333))
            assert.is_same({
                --g    r    b
                  0,   0, 77, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(500))
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(667))
            assert.is_same({
                --g    r    b
                  0,   0, 77, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(833))
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(2000))
        end)
        it("should make the on board light blink", function()
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 0))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 167))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 333))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 500))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 667))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 833))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 1000))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 1167))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 1333))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 1500))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 1667))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 1833))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 2000))
        end)
    end)
    insulate("waitForWifiIp()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
        MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
        MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock

        require "src.my-led"
        _G.MyLed.waitForWifiIp()

        it("should blink blue on the operator light", function()
            for time=0,3000,100 do
                assert.is_same(1, _G.pinByTime:get(pinOpR, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinOpG, time), time .. "s")
            end
            assert.is_same(0, _G.pinByTime:get(pinOpB, 0))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 250))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 500))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 750))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 1000))

        end)
        it("should not show anything on the stage light", function()
            for time=0,3000,100 do
                assert.is_same(1, _G.pinByTime:get(pinMainR, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainG, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainB, time), time .. "s")
            end
        end)
        it("should blink blue on the ws2128 strip", function()
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(0))
            assert.is_same({
                --g    r    b
                  0,   0, 77, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(250))
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(500))
            assert.is_same({
                --g    r    b
                  0,   0, 77, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(750))
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(1000))
        end)
        it("should make the on board light blink", function()
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 0))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 250))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 500))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 750))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 1000))
        end)
    end)
    insulate("waitForServerConnection()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
        MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
        MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock

        require "src.my-led"
        _G.MyLed.waitForServerConnection()

        it("should blink blue on the operator light", function()
            for time=0,3000,100 do
                assert.is_same(1, _G.pinByTime:get(pinOpR, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinOpG, time), time .. "s")
            end
            assert.is_same(0, _G.pinByTime:get(pinOpB, 0))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 167))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 333))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 500))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 667))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 833))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 1000))

        end)
        it("should not show anything on the stage light", function()
            for time=0,3000,100 do
                assert.is_same(1, _G.pinByTime:get(pinMainR, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainG, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainB, time), time .. "s")
            end
        end)
        it("should blink blue on the ws2128 strip", function()
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(0))
            assert.is_same({
                --g    r    b
                  0,   0, 77, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(167))
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(333))
            assert.is_same({
                --g    r    b
                  0,   0, 77, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(500))
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(1000))
        end)
        it("should make the on board light blink", function()
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 0))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 167))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 333))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 500))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 667))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 883))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 1000))
        end)
    end)
    insulate("onPreview()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
        MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
        MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock

        require "src.my-led"
        _G.MyLed.onPreview()

        it("should show a permanent green on the operator light", function()
            for time=0,3000,100 do
                assert.is_same(1, _G.pinByTime:get(pinOpR, time), time .. "s")
                assert.is_same(0, _G.pinByTime:get(pinOpG, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinOpB, time), time .. "s")
            end
        end)
        it("should show a permanent green on the stage light", function()
            for time=0,3000,100 do
                assert.is_same(1, _G.pinByTime:get(pinMainR, time), time .. "s")
                assert.is_same(0, _G.pinByTime:get(pinMainG, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainB, time), time .. "s")
            end
        end)
        it("should show a permanent green on the ws2128 strip", function()
            assert.is_same({
                --g    r    b
                255,   0,   0, --operator
                255,   0,   0, -- stage
            }, _G.ws2812:getDataAt(0))
        end)
        it("should keep the on board light on", function()
            for time=0,3000,100 do
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, time), time .. "s")
            end
        end)
    end)
    insulate("onAir()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
        MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
        MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock

        require "src.my-led"
        _G.MyLed.onAir()

        it("should show a permanent red on the operator light", function()
            for time=0,3000,100 do
                assert.is_same(0, _G.pinByTime:get(pinOpR, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinOpG, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinOpB, time), time .. "s")
            end
        end)
        it("should show a permanent red on the stage light", function()
            for time=0,3000,100 do
                assert.is_same(0, _G.pinByTime:get(pinMainR, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainG, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainB, time), time .. "s")
            end
        end)
        it("should show a permanent red on the ws2128 strip", function()
            assert.is_same({
                --g    r    b
                  0, 255,   0, --operator
                  0, 255,   0, -- stage
            }, _G.ws2812:getDataAt(0))
        end)
        it("should keep the on board light on", function()
            for time=0,3000,100 do
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, time), time .. "s")
            end
        end)
    end)
    insulate("onRelease()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
        MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
        MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock

        require "src.my-led"
        _G.MyLed.onRelease()

        it("should show a dim green on the operator light", function()
            for time=0,3000,100 do
                assert.is_same(1, _G.pinByTime:get(pinOpR, time), time .. "s")
                assert.is_same(0.99, _G.pinByTime:get(pinOpG, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinOpB, time), time .. "s")
            end
        end)
        it("should not show anything on the stage light", function()
            for time=0,3000,100 do
                assert.is_same(1, _G.pinByTime:get(pinMainR, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainG, time), time .. "s")
                assert.is_same(1, _G.pinByTime:get(pinMainB, time), time .. "s")
            end
        end)
        it("should show a dim green on the ws2128 strip", function()
            assert.is_same({
                --g    r    b
                  3,   0,   0, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(0))
        end)
        it("should keep the on board light on", function()
            for time=0,3000,100 do
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, time), time .. "s")
            end
        end)
    end)
    insulate("onHighlight()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
        MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
        MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock

        require "src.my-led"
        _G.MyLed.onHighlight()

        it("should flash the operator light white", function()
            for pin in pairs({pinOpR, pinOpG, pinOpB}) do
                assert.is_same(0, _G.pinByTime:get(pin, 0), "pin " .. pin)
                assert.is_same(0.7, _G.pinByTime:get(pin, 125), "pin " .. pin)
                assert.is_same(0, _G.pinByTime:get(pin, 250), "pin " .. pin)
                assert.is_same(0.7, _G.pinByTime:get(pin, 375), "pin " .. pin)
                assert.is_same(0, _G.pinByTime:get(pin, 500), "pin " .. pin)
                assert.is_same(0.7, _G.pinByTime:get(pin, 625), "pin " .. pin)
                assert.is_same(0, _G.pinByTime:get(pin, 750), "pin " .. pin)
                assert.is_same(0.7, _G.pinByTime:get(pin, 875), "pin " .. pin)
                assert.is_same(0, _G.pinByTime:get(pin, 1000), "pin " .. pin)
            end
        end)
        it("should flash the stage light white", function()
            for pin in pairs({pinMainR, pinMainG, pinMainB}) do
                assert.is_same(0, _G.pinByTime:get(pin, 0), "pin " .. pin)
                assert.is_same(0.7, _G.pinByTime:get(pin, 125), "pin " .. pin)
                assert.is_same(0, _G.pinByTime:get(pin, 250), "pin " .. pin)
                assert.is_same(0.7, _G.pinByTime:get(pin, 375), "pin " .. pin)
                assert.is_same(0, _G.pinByTime:get(pin, 500), "pin " .. pin)
                assert.is_same(0.7, _G.pinByTime:get(pin, 625), "pin " .. pin)
                assert.is_same(0, _G.pinByTime:get(pin, 750), "pin " .. pin)
                assert.is_same(0.7, _G.pinByTime:get(pin, 875), "pin " .. pin)
                assert.is_same(0, _G.pinByTime:get(pin, 1000), "pin " .. pin)
            end
        end)
        it("should flash in white on the ws2128 strip", function()
            assert.is_same({
                --g    r    b
                255, 255, 255, --operator
                255, 255, 255, -- stage
            }, _G.ws2812:getDataAt(0))
            assert.is_same({
                --g    r    b
                 77,  77,  77, --operator
                 77,  77,  77, -- stage
            }, _G.ws2812:getDataAt(125))
            assert.is_same({
                --g    r    b
                255, 255, 255, --operator
                255, 255, 255, -- stage
            }, _G.ws2812:getDataAt(250))
            assert.is_same({
                --g    r    b
                 77,  77,  77, --operator
                 77,  77,  77, -- stage
            }, _G.ws2812:getDataAt(375))
            assert.is_same({
                --g    r    b
                255, 255, 255, --operator
                255, 255, 255, -- stage
            }, _G.ws2812:getDataAt(500))
            assert.is_same({
                --g    r    b
                 77,  77,  77, --operator
                 77,  77,  77, -- stage
            }, _G.ws2812:getDataAt(625))
            assert.is_same({
                --g    r    b
                255, 255, 255, --operator
                255, 255, 255, -- stage
            }, _G.ws2812:getDataAt(750))
            assert.is_same({
                --g    r    b
                 77,  77,  77, --operator
                 77,  77,  77, -- stage
            }, _G.ws2812:getDataAt(875))
            assert.is_same({
                --g    r    b
                255, 255, 255, --operator
                255, 255, 255, -- stage
            }, _G.ws2812:getDataAt(1000))
        end)
        it("should flash the on board light", function()
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 0))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 125))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 250))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 375))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 500))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 625))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 750))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 875))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 1000))
        end)
    end)
    describe("supports operatorType() \"rgb-\"", function()
        insulate("for example onAir()", function()
            require "spec.nodemcu-mock"
            require "src.my-settings"
            MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.operatorType = function() return LightTypes.COMMON_CATHODE end -- mock the setting

            require "src.my-led"
            _G.MyLed.onAir()

            it("should invert levels of the operator light", function()
                for time=0,3000,100 do
                    assert.is_same(1, _G.pinByTime:get(pinOpR, time), time .. "s")
                    assert.is_same(0, _G.pinByTime:get(pinOpG, time), time .. "s")
                    assert.is_same(0, _G.pinByTime:get(pinOpB, time), time .. "s")
                end
            end)
            it("should not invert levels of the stage light", function()
                for time=0,3000,100 do
                    assert.is_same(0, _G.pinByTime:get(pinMainR, time), time .. "s")
                    assert.is_same(1, _G.pinByTime:get(pinMainG, time), time .. "s")
                    assert.is_same(1, _G.pinByTime:get(pinMainB, time), time .. "s")
                end
            end)
            it("should not change the ws2128 strip", function()
                assert.is_same({
                    --g    r    b
                      0, 255,   0, --operator
                      0, 255,   0, -- stage
                }, _G.ws2812:getDataAt(0))
            end)
            it("should not invert the levels of the board light", function()
                for time=0,3000,100 do
                    assert.is_same(0, _G.pinByTime:get(pinOnBoard, time), time .. "s")
                end
            end)
        end)
        insulate("for example waitForWifiConnection()", function()
            require "spec.nodemcu-mock"
            require "src.my-settings"
            MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.operatorType = function() return LightTypes.COMMON_CATHODE end -- mock the setting

            require "src.my-led"
            _G.MyLed.waitForWifiConnection()

            it("should invert levels of the operator light", function()
                for time=0,3000,100 do
                    assert.is_same(0, _G.pinByTime:get(pinOpR, time), time .. "s")
                    assert.is_same(0, _G.pinByTime:get(pinOpG, time), time .. "s")
                end
                assert.is_same(1, _G.pinByTime:get(pinOpB, 0))
                assert.is_same(1, _G.pinByTime:get(pinOpB, 100))
                assert.is_same(1, _G.pinByTime:get(pinOpB, 200))
                assert.is_same(1, _G.pinByTime:get(pinOpB, 300))
                assert.is_same(1, _G.pinByTime:get(pinOpB, 400))
                assert.is_same(0.3, _G.pinByTime:get(pinOpB, 500))
                assert.is_same(0.3, _G.pinByTime:get(pinOpB, 600))
                assert.is_same(0.3, _G.pinByTime:get(pinOpB, 700))
                assert.is_same(0.3, _G.pinByTime:get(pinOpB, 800))
                assert.is_same(0.3, _G.pinByTime:get(pinOpB, 900))
                assert.is_same(1, _G.pinByTime:get(pinOpB, 1000))

            end)
            it("should not invert levels of the stage light", function()
                for time=0,3000,100 do
                    assert.is_same(1, _G.pinByTime:get(pinMainR, time), time .. "s")
                    assert.is_same(1, _G.pinByTime:get(pinMainG, time), time .. "s")
                    assert.is_same(1, _G.pinByTime:get(pinMainB, time), time .. "s")
                end
            end)
            it("should not change the ws2128 strip", function()
                assert.is_same({
                    --g    r    b
                      0,   0, 255, --operator
                      0,   0,   0, -- stage
                }, _G.ws2812:getDataAt(0))
                assert.is_same({
                    --g    r    b
                      0,   0, 77, --operator
                      0,   0,   0, -- stage
                }, _G.ws2812:getDataAt(500))
                assert.is_same({
                    --g    r    b
                      0,   0, 255, --operator
                      0,   0,   0, -- stage
                }, _G.ws2812:getDataAt(1000))
            end)
            it("should not invert the levels of the board light", function()
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 0))
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 100))
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 200))
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 300))
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 400))
                assert.is_same(1, _G.pinByTime:get(pinOnBoard, 500))
                assert.is_same(1, _G.pinByTime:get(pinOnBoard, 600))
                assert.is_same(1, _G.pinByTime:get(pinOnBoard, 700))
                assert.is_same(1, _G.pinByTime:get(pinOnBoard, 800))
                assert.is_same(1, _G.pinByTime:get(pinOnBoard, 900))
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 1000))
            end)
        end)
    end)
    describe("supports stageType() \"rgb-\"", function()
        insulate("for example onAir()", function()
            require "spec.nodemcu-mock"
            require "src.my-settings"
            MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.stageType = function() return LightTypes.COMMON_CATHODE end -- mock the setting

            require "src.my-led"
            _G.MyLed.onAir()

            it("should not invert levels of the operator light", function()
                for time=0,3000,100 do
                    assert.is_same(0, _G.pinByTime:get(pinOpR, time), time .. "s")
                    assert.is_same(1, _G.pinByTime:get(pinOpG, time), time .. "s")
                    assert.is_same(1, _G.pinByTime:get(pinOpB, time), time .. "s")
                end
            end)
            it("should invert levels of the stage light", function()
                for time=0,3000,100 do
                    assert.is_same(1, _G.pinByTime:get(pinMainR, time), time .. "s")
                    assert.is_same(0, _G.pinByTime:get(pinMainG, time), time .. "s")
                    assert.is_same(0, _G.pinByTime:get(pinMainB, time), time .. "s")
                end
            end)
            it("should not change the ws2128 strip", function()
                assert.is_same({
                    --g    r    b
                      0, 255,   0, --operator
                      0, 255,   0, -- stage
                }, _G.ws2812:getDataAt(0))
            end)
            it("should not invert the levels of the board light", function()
                for time=0,3000,100 do
                    assert.is_same(0, _G.pinByTime:get(pinOnBoard, time), time .. "s")
                end
            end)
        end)
        insulate("for example waitForWifiConnection()", function()
            require "spec.nodemcu-mock"
            require "src.my-settings"
            MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.stageType = function() return LightTypes.COMMON_CATHODE end -- mock the setting

            require "src.my-led"
            _G.MyLed.waitForWifiConnection()

            it("should not invert levels of the operator light", function()
                for time=0,3000,100 do
                    assert.is_same(1, _G.pinByTime:get(pinOpR, time), time .. "s")
                    assert.is_same(1, _G.pinByTime:get(pinOpG, time), time .. "s")
                end
                assert.is_same(0, _G.pinByTime:get(pinOpB, 0))
                assert.is_same(0, _G.pinByTime:get(pinOpB, 100))
                assert.is_same(0, _G.pinByTime:get(pinOpB, 200))
                assert.is_same(0, _G.pinByTime:get(pinOpB, 300))
                assert.is_same(0, _G.pinByTime:get(pinOpB, 400))
                assert.is_same(0.7, _G.pinByTime:get(pinOpB, 500))
                assert.is_same(0.7, _G.pinByTime:get(pinOpB, 600))
                assert.is_same(0.7, _G.pinByTime:get(pinOpB, 700))
                assert.is_same(0.7, _G.pinByTime:get(pinOpB, 800))
                assert.is_same(0.7, _G.pinByTime:get(pinOpB, 900))
                assert.is_same(0, _G.pinByTime:get(pinOpB, 1000))

            end)
            it("should invert levels of the stage light", function()
                for time=0,3000,100 do
                    assert.is_same(0, _G.pinByTime:get(pinMainR, time), time .. "s")
                    assert.is_same(0, _G.pinByTime:get(pinMainG, time), time .. "s")
                    assert.is_same(0, _G.pinByTime:get(pinMainB, time), time .. "s")
                end
            end)
            it("should not change the ws2128 strip", function()
                assert.is_same({
                    --g    r    b
                      0,   0, 255, --operator
                      0,   0,   0, -- stage
                }, _G.ws2812:getDataAt(0))
                assert.is_same({
                    --g    r    b
                      0,   0, 77, --operator
                      0,   0,   0, -- stage
                }, _G.ws2812:getDataAt(500))
                assert.is_same({
                    --g    r    b
                      0,   0, 255, --operator
                      0,   0,   0, -- stage
                }, _G.ws2812:getDataAt(1000))
            end)
            it("should not invert the levels of the board light", function()
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 0))
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 100))
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 200))
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 300))
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 400))
                assert.is_same(1, _G.pinByTime:get(pinOnBoard, 500))
                assert.is_same(1, _G.pinByTime:get(pinOnBoard, 600))
                assert.is_same(1, _G.pinByTime:get(pinOnBoard, 700))
                assert.is_same(1, _G.pinByTime:get(pinOnBoard, 800))
                assert.is_same(1, _G.pinByTime:get(pinOnBoard, 900))
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 1000))
            end)
        end)
    end)
    describe("supports stageType() and operatorType \"rgb-\"", function()
        insulate("for example onAir()", function()
            require "spec.nodemcu-mock"
            require "src.my-settings"
            MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.operatorType = function() return LightTypes.COMMON_CATHODE end -- mock the setting
            MySettings.stageType = function() return LightTypes.COMMON_CATHODE end -- mock the setting

            require "src.my-led"
            _G.MyLed.onAir()

            it("should invert levels of the operator light", function()
                for time=0,3000,100 do
                    assert.is_same(1, _G.pinByTime:get(pinOpR, time), time .. "s")
                    assert.is_same(0, _G.pinByTime:get(pinOpG, time), time .. "s")
                    assert.is_same(0, _G.pinByTime:get(pinOpB, time), time .. "s")
                end
            end)
            it("should invert levels of the stage light", function()
                for time=0,3000,100 do
                    assert.is_same(1, _G.pinByTime:get(pinMainR, time), time .. "s")
                    assert.is_same(0, _G.pinByTime:get(pinMainG, time), time .. "s")
                    assert.is_same(0, _G.pinByTime:get(pinMainB, time), time .. "s")
                end
            end)
            it("should not change the ws2128 strip", function()
                assert.is_same({
                    --g    r    b
                      0, 255,   0, --operator
                      0, 255,   0, -- stage
                }, _G.ws2812:getDataAt(0))
            end)
            it("should not invert the levels of the board light", function()
                for time=0,3000,100 do
                    assert.is_same(0, _G.pinByTime:get(pinOnBoard, time), time .. "s")
                end
            end)
        end)
    end)
    describe("supports operatorNumberOfWs2812Lights() and stageNumberOfWs2812Lights()", function()
        insulate(function()
            require "spec.nodemcu-mock"
            require "src.my-settings"
            MySettings.operatorNumberOfWs2812Lights = function() return 2 end -- mock
            MySettings.stageNumberOfWs2812Lights = function() return 4 end -- mock

            require "src.my-led"
            _G.MyLed.initial()

            it("should show operator lights before stage lights", function()
                assert.is_same({
                    --g    r    b
                      0,   0, 255, --operator
                      0,   0, 255, --operator
                      0,   0,   0, -- stage
                      0,   0,   0, -- stage
                      0,   0,   0, -- stage
                      0,   0,   0, -- stage
                }, _G.ws2812:getDataAt(0))
            end)
        end)
        insulate(function()
            require "spec.nodemcu-mock"
            require "src.my-settings"
            MySettings.operatorNumberOfWs2812Lights = function() return 2 end -- mock
            MySettings.stageNumberOfWs2812Lights = function() return 0 end -- mock

            require "src.my-led"
            _G.MyLed.initial()

            it("should only send operator lights when stageNumberOfWs2812Lights is 0", function()
                assert.is_same({
                    --g    r    b
                      0,   0, 255,
                      0,   0, 255,
                }, _G.ws2812:getDataAt(0))
            end)
        end)
        insulate(function()
            require "spec.nodemcu-mock"
            require "src.my-settings"
            MySettings.operatorNumberOfWs2812Lights = function() return 0 end -- mock
            MySettings.stageNumberOfWs2812Lights = function() return 2 end -- mock

            require "src.my-led"
            _G.MyLed.initial()

            it("should only send stage lights when stageNumberOfWs2812Lights is 0", function()
                assert.is_same({
                    --g    r    b
                      0,   0,   0,
                      0,   0,   0,
                }, _G.ws2812:getDataAt(0))
            end)
        end)
        insulate(function()
            require "spec.nodemcu-mock"
            require "src.my-settings"
            MySettings.operatorNumberOfWs2812Lights = function() return 0 end -- mock
            MySettings.stageNumberOfWs2812Lights = function() return 0 end -- mock

            require "src.my-led"
            _G.MyLed.initial()

            it("should not send anything when both settings are 0", function()
                assert.is_same(nil, _G.ws2812:getDataAt(0))
            end)
        end)
    end)
end)