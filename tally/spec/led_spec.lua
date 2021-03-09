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
                assert.is_same({1, 1, 0}, {
                    _G.pinByTime:get(pinOpR, time),
                    _G.pinByTime:get(pinOpG, time),
                    _G.pinByTime:get(pinOpB, time)
                }, time .. "s")
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
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 150))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 300))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 450))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 600))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 750))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 900))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 1050))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 1200))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 1350))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 1500))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 1650))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 1800))

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
            }, _G.ws2812:getDataAt(150))
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(300))
            assert.is_same({
                --g    r    b
                  0,   0, 77, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(450))
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(600))
            assert.is_same({
                --g    r    b
                  0,   0, 77, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(750))
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(1800))
        end)
        it("should make the on board light blink", function()
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 0))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 150))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 300))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 450))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 600))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 750))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 900))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 1050))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 1200))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 1350))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 1500))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 1650))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 1800))
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
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 150))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 300))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 450))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 600))
            assert.is_same(0.7, _G.pinByTime:get(pinOpB, 750))
            assert.is_same(0, _G.pinByTime:get(pinOpB, 900))

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
            }, _G.ws2812:getDataAt(150))
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(300))
            assert.is_same({
                --g    r    b
                  0,   0, 77, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(450))
            assert.is_same({
                --g    r    b
                  0,   0, 255, --operator
                  0,   0,   0, -- stage
            }, _G.ws2812:getDataAt(900))
        end)
        it("should make the on board light blink", function()
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 0))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 150))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 300))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 450))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 600))
            assert.is_same(1, _G.pinByTime:get(pinOnBoard, 750))
            assert.is_same(0, _G.pinByTime:get(pinOnBoard, 900))
        end)
    end)
    describe("static()", function()
        insulate("can show arbitrary colors", function()
            require "spec.nodemcu-mock"
            require "src.my-settings"
            MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock

            require "src.my-led"
            _G.MyLed.static(255, 127, 63, 63, 127, 255)

            it("should correctly show the operator light", function()
                assert.is_same(0, _G.pinByTime:get(pinOpR, 0))
                assert.is_same(0.5, _G.pinByTime:get(pinOpG, 0))
                assert.is_same(0.75, _G.pinByTime:get(pinOpB, 0))
            end)
            it("should correctly show the stage light", function()
                assert.is_same(0.75, _G.pinByTime:get(pinMainR, 0))
                assert.is_same(0.5, _G.pinByTime:get(pinMainG, 0))
                assert.is_same(0, _G.pinByTime:get(pinMainB, 0))
            end)
            it("should correcly show the ws2128 strip", function()
                assert.is_same({
                    --g    r    b
                    127, 255,  63, --operator
                    127,  63, 255, -- stage
                }, _G.ws2812:getDataAt(0))
            end)
            it("should leave the board light on", function()
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 0))
            end)
        end)
    end)
    describe("flash()", function()
        insulate("can show arbitrary colors and flash patterns", function()
            require "spec.nodemcu-mock"
            require "src.my-settings"
            MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock

            require "src.my-led"
            _G.MyLed.flash(255, 127, 63, 63, 127, 255, {true, false}, 500)

            it("should correctly show the operator light", function()
                assert.is_same(0, _G.pinByTime:get(pinOpR, 0))
                assert.is_same(0.5, _G.pinByTime:get(pinOpG, 0))
                assert.is_same(0.75, _G.pinByTime:get(pinOpB, 0))

                assert.is_same(0.7, _G.pinByTime:get(pinOpR, 500))
                assert.is_same(0.85, _G.pinByTime:get(pinOpG, 500))
                assert.is_same(0.93, _G.pinByTime:get(pinOpB, 500))

                assert.is_same(0, _G.pinByTime:get(pinOpR, 1000))
                assert.is_same(0.5, _G.pinByTime:get(pinOpG, 1000))
                assert.is_same(0.75, _G.pinByTime:get(pinOpB, 1000))
            end)
            it("should correctly show the stage light", function()
                assert.is_same(0.75, _G.pinByTime:get(pinMainR, 0))
                assert.is_same(0.5, _G.pinByTime:get(pinMainG, 0))
                assert.is_same(0, _G.pinByTime:get(pinMainB, 0))

                assert.is_same(0.93, _G.pinByTime:get(pinMainR, 500))
                assert.is_same(0.85, _G.pinByTime:get(pinMainG, 500))
                assert.is_same(0.7, _G.pinByTime:get(pinMainB, 500))

                assert.is_same(0.75, _G.pinByTime:get(pinMainR, 1000))
                assert.is_same(0.5, _G.pinByTime:get(pinMainG, 1000))
                assert.is_same(0, _G.pinByTime:get(pinMainB, 1000))
            end)
            it("should correcly show the ws2128 strip", function()
                assert.is_same({
                    --g    r    b
                    127, 255,  63, --operator
                    127,  63, 255, -- stage
                }, _G.ws2812:getDataAt(0))
                assert.is_same({
                    --g    r    b
                     39,  77,  19, --operator
                     39,  19,  77, -- stage
                }, _G.ws2812:getDataAt(500))
                assert.is_same({
                    --g    r    b
                    127, 255,  63, --operator
                    127,  63, 255, -- stage
                }, _G.ws2812:getDataAt(1000))
            end)
            it("should leave the board light on", function()
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 0))
            end)
        end)
    end)
    describe("supports operatorType() \"rgb-\"", function()
        insulate("for example with red color", function()
            require "spec.nodemcu-mock"
            require "src.my-settings"
            MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.operatorType = function() return LightTypes.COMMON_CATHODE end -- mock the setting

            require "src.my-led"
            _G.MyLed.static(255, 0, 0, 255, 0, 0)

            it("should invert levels of the operator light", function()
                assert.is_same(1, _G.pinByTime:get(pinOpR, 0))
                assert.is_same(0, _G.pinByTime:get(pinOpG, 0))
                assert.is_same(0, _G.pinByTime:get(pinOpB, 0))
            end)
            it("should not invert levels of the stage light", function()
                assert.is_same(0, _G.pinByTime:get(pinMainR, 0))
                assert.is_same(1, _G.pinByTime:get(pinMainG, 0))
                assert.is_same(1, _G.pinByTime:get(pinMainB, 0))
            end)
            it("should not change the ws2128 strip", function()
                assert.is_same({
                    --g    r    b
                      0, 255,   0, --operator
                      0, 255,   0, -- stage
                }, _G.ws2812:getDataAt(0))
            end)
            it("should not invert the levels of the board light", function()
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 0))
            end)
        end)
    end)
    describe("supports stageType() \"rgb-\"", function()
        insulate("for example with red color", function()
            require "spec.nodemcu-mock"
            require "src.my-settings"
            MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.stageType = function() return LightTypes.COMMON_CATHODE end -- mock the setting

            require "src.my-led"
            _G.MyLed.static(255, 0, 0, 255, 0, 0)

            it("should not invert levels of the operator light", function()
                assert.is_same(0, _G.pinByTime:get(pinOpR, 0))
                assert.is_same(1, _G.pinByTime:get(pinOpG, 0))
                assert.is_same(1, _G.pinByTime:get(pinOpB, 0))
            end)
            it("should invert levels of the stage light", function()
                assert.is_same(1, _G.pinByTime:get(pinMainR, 0))
                assert.is_same(0, _G.pinByTime:get(pinMainG, 0))
                assert.is_same(0, _G.pinByTime:get(pinMainB, 0))
            end)
            it("should not change the ws2128 strip", function()
                assert.is_same({
                    --g    r    b
                      0, 255,   0, --operator
                      0, 255,   0, -- stage
                }, _G.ws2812:getDataAt(0))
            end)
            it("should not invert the levels of the board light", function()
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 0))
            end)
        end)
    end)
    describe("supports stageType() and operatorType \"rgb-\"", function()
        insulate("for example with red color", function()
            require "spec.nodemcu-mock"
            require "src.my-settings"
            MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock
            MySettings.operatorType = function() return LightTypes.COMMON_CATHODE end -- mock the setting
            MySettings.stageType = function() return LightTypes.COMMON_CATHODE end -- mock the setting

            require "src.my-led"
            _G.MyLed.static(255, 0, 0, 255, 0, 0)

            it("should invert levels of the operator light", function()
                assert.is_same(1, _G.pinByTime:get(pinOpR, 0))
                assert.is_same(0, _G.pinByTime:get(pinOpG, 0))
                assert.is_same(0, _G.pinByTime:get(pinOpB, 0))
            end)
            it("should invert levels of the stage light", function()
                assert.is_same(1, _G.pinByTime:get(pinMainR, 0))
                assert.is_same(0, _G.pinByTime:get(pinMainG, 0))
                assert.is_same(0, _G.pinByTime:get(pinMainB, 0))
            end)
            it("should not change the ws2128 strip", function()
                assert.is_same({
                    --g    r    b
                      0, 255,   0, --operator
                      0, 255,   0, -- stage
                }, _G.ws2812:getDataAt(0))
            end)
            it("should not invert the levels of the board light", function()
                assert.is_same(0, _G.pinByTime:get(pinOnBoard, 0))
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
    describe("supports operatorWs2812Type() and stageWs2812Type()", function()
        require "spec.nodemcu-mock"
        require "src.my-settings"
        MySettings.operatorNumberOfWs2812Lights = function() return 1 end -- mock
        MySettings.stageNumberOfWs2812Lights = function() return 1 end -- mock
        insulate(function()
            MySettings.operatorWs2812Type = function() return "grb" end -- mock
            MySettings.stageWs2812Type = function() return "grb" end -- mock

            require "src.my-led"
            _G.MyLed.static(255, 127, 63, 31, 15, 0)

            it("shows GRB on stage and operator", function()
                assert.is_same({
                    --g    r    b
                    127, 255,  63,
                     15,  31,   0,
                }, _G.ws2812:getDataAt(0))
            end)
        end)
        insulate(function()
            MySettings.operatorWs2812Type = function() return "rgb" end -- mock
            MySettings.stageWs2812Type = function() return "grb" end -- mock

            require "src.my-led"
            _G.MyLed.static(255, 127, 63, 31, 15, 0)

            it("shows GRB on stage and RGB on operator", function()
                assert.is_same({
                    --r    g    b
                    255, 127,  63,
                    --g    r    b
                     15,  31,   0,
                }, _G.ws2812:getDataAt(0))
            end)
        end)
        insulate(function()
            MySettings.operatorWs2812Type = function() return "grb" end -- mock
            MySettings.stageWs2812Type = function() return "rgb" end -- mock

            require "src.my-led"
            _G.MyLed.static(255, 127, 63, 31, 15, 0)

            it("shows RGB on stage and GRB on operator", function()
                assert.is_same({
                    --g    r    b
                    127, 255,  63,
                    --r    g    b
                     31,  15,   0,
                }, _G.ws2812:getDataAt(0))
            end)
        end)
        insulate(function()
            MySettings.operatorWs2812Type = function() return "rgb" end -- mock
            MySettings.stageWs2812Type = function() return "rgb" end -- mock

            require "src.my-led"
            _G.MyLed.static(255, 127, 63, 31, 15, 0)

            it("shows RGB on stage and operator", function()
                assert.is_same({
                    --r    g    b
                    255, 127,  63,
                    --r    g    b
                     31,  15,   0,
                }, _G.ws2812:getDataAt(0))
            end)
        end)
    end)
end)