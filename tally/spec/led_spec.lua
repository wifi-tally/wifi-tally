local pinOpG, pinOpR, pinOpB = 1, 2, 3
local pinMainG, pinMainR, pinMainB = 5, 6, 7
local pinOnBoard = 0

describe("Led", function()
    insulate("initial()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
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
        it("should turn the on board light on", function()
            for time=0,3000,100 do
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, time), time .. "s")
            end
        end)
    end)
    insulate("waitForWifiConnection()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
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
        it("should keep the on board light on", function()
            for time=0,3000,100 do
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, time), time .. "s")
            end
        end)
    end)
    insulate("onAir()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
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
        it("should keep the on board light on", function()
            for time=0,3000,100 do
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, time), time .. "s")
            end
        end)
    end)
    insulate("onRelease()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
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
        it("should keep the on board light on", function()
            for time=0,3000,100 do
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, time), time .. "s")
            end
        end)
    end)
    insulate("onHighlight()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
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
end)