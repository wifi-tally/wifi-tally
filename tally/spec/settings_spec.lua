describe("Settings parser", function()

    require "spec.nodemcu-mock"

    local function mockSettings(fileName, additionalLines)
        _G.file = {
            exists = function() return type(fileName) == 'string' end,
            open = function()
                local lines = {}
                for line in io.lines("spec/fixtures/" .. fileName) do
                    table.insert(lines, line)
                end

                for _, line in pairs(additionalLines or {}) do
                    table.insert(lines, line)
                end

                local idx = 0

                return {
                    readline = function(_)
                        idx = idx + 1
                        return lines[idx]
                    end,
                    close = function() end,
                }
            end,
        }

        local warnings = {}
        _G.MyLog = {
            warning = function(warning) table.insert(warnings, warning) end,
            getWarnings = function() return warnings end,
        }
    end
    -- auto-insulate every test
    local realIt = it
    it = function(name, func)
        insulate(function()
            realIt(name, func)
        end)
    end

    it("should parse all settings", function()
        mockSettings("settings-all.ini")
        require "src.my-settings"

        assert.is_same("MyWifi", MySettings.staSsid())
        assert.is_same("topsecret", MySettings.staPw())
        assert.is_same("10.10.1.1", MySettings.hubIp())
        assert.is_same(4242, MySettings.hubPort())
        assert.is_same("Doe", MySettings.name())
        assert.is_same("Tally-Doe", MySettings.hostName())
    end)

    it("should parse a messy file", function()
        mockSettings("settings-messy-file.ini")
        require "src.my-settings"

        assert.is_same("MyWifi", MySettings.staSsid())
        assert.is_same("topsecret", MySettings.staPw())
        assert.is_same("10.10.1.1", MySettings.hubIp())
        assert.is_same(4242, MySettings.hubPort())
        assert.is_same("Doe", MySettings.name())
        assert.is_same("Tally-Doe", MySettings.hostName())
    end)

    it("should use defaults when optional values are", function()
        mockSettings("settings-partial.ini")
        require "src.my-settings"

        assert.is_same(7411, MySettings.hubPort())
        assert.is_same("bc614e", MySettings.name())
        assert.is_same("Tally-bc614e", MySettings.hostName())
    end)

    it("should accept tally name with spaces", function()
        mockSettings("settings-tallyname.ini")
        require "src.my-settings"

        assert.is_same("John Doe", MySettings.name())
        assert.is_same("Tally-John-Doe", MySettings.hostName())
    end)

    it("should accept tally name with weired ascii chars", function()
        mockSettings("settings-tallyname2.ini")
        require "src.my-settings"

        assert.is_true(MySettings.name():len() <= 32)
        assert.is_true(MySettings.hostName():len() <= 32)
        assert.is_same("Tally-this-is-a-really-messe", MySettings.hostName())
    end)

    describe("operator.type", function()
        it("should be grb+ by default", function()
            mockSettings("settings-all.ini")
            require "src.my-settings"

            assert.is_same("grb+", MySettings.operatorType())
        end)
        it("should support grb+", function()
            mockSettings("settings-all.ini", {
                "operator.type=grb+"
            })
            require "src.my-settings"

            assert.is_same("grb+", MySettings.operatorType())
        end)
        it("should support grb-", function()
            mockSettings("settings-all.ini", {
                "operator.type=grb-"
            })
            require "src.my-settings"

            assert.is_same("grb-", MySettings.operatorType())
        end)
        it("should ignore case", function()
            mockSettings("settings-all.ini", {
                "operator.type=GrB-"
            })
            require "src.my-settings"

            assert.is_same("grb-", MySettings.operatorType())
        end)
        it("should log a warning on invalid value and use the default", function()
            mockSettings("settings-all.ini", {
                "operator.type=invalid"
            })

            local warnings = {}
            _G.MyLog = {
                warning = function(warning) table.insert(warnings, warning) end
            }

            require "src.my-settings"

            assert.is_same("Invalid operator.type \"invalid\"", warnings[1])
            assert.is_same("grb+", MySettings.operatorType())
        end)
    end)

    describe("stage.type", function()
        it("should be grb+ by default", function()
            mockSettings("settings-all.ini")
            require "src.my-settings"

            assert.is_same("grb+", MySettings.stageType())
        end)
        it("should support grb+", function()
            mockSettings("settings-all.ini", {
                "stage.type=grb+"
            })
            require "src.my-settings"

            assert.is_same("grb+", MySettings.stageType())
        end)
        it("should support grb-", function()
            mockSettings("settings-all.ini", {
                "stage.type=grb-"
            })
            require "src.my-settings"

            assert.is_same("grb-", MySettings.stageType())
        end)
        it("should ignore case", function()
            mockSettings("settings-all.ini", {
                "stage.type=GrB-"
            })
            require "src.my-settings"

            assert.is_same("grb-", MySettings.stageType())
        end)
        it("should log a warning on invalid value and use the default", function()
            mockSettings("settings-all.ini", {
                "stage.type=invalid"
            })

            local warnings = {}
            _G.MyLog = {
                warning = function(warning) table.insert(warnings, warning) end
            }

            require "src.my-settings"

            assert.is_same("Invalid stage.type \"invalid\"", warnings[1])
            assert.is_same("grb+", MySettings.stageType())
        end)
    end)

    insulate("operator.ws2812", function()
        insulate("should be 5 by default", function()
            it(function()
                mockSettings("settings-all.ini")
                require "src.my-settings"

                assert.is_same(5, MySettings.operatorNumberOfWs2812Lights())
            end)
        end)
        insulate("should allow to set it", function()
            it(function()
                mockSettings("settings-all.ini", {
                    "operator.ws2812=2"
                })
                require "src.my-settings"

                assert.is_same(2, MySettings.operatorNumberOfWs2812Lights())
            end)
        end)
        insulate("should log a warning on invalid string", function()
            it(function()
                mockSettings("settings-all.ini", {
                    "operator.ws2812=invalid"
                })

                require "src.my-settings"

                assert.is_same("operator.ws2812 needs to be number between 0 and 10, but got \"invalid\"", MyLog.getWarnings()[1])
                assert.is_same(5, MySettings.operatorNumberOfWs2812Lights())
            end)
        end)
        insulate("should log a warning on negative number", function()
            it(function()
                mockSettings("settings-all.ini", {
                    "operator.ws2812=-2"
                })

                require "src.my-settings"

                assert.is_same("operator.ws2812 needs to be number between 0 and 10, but got \"-2\"", MyLog.getWarnings()[1])
                assert.is_same(5, MySettings.operatorNumberOfWs2812Lights())
            end)
        end)
        insulate("should log a warning on number bigger as 10", function()
            it(function()
                mockSettings("settings-all.ini", {
                    "operator.ws2812=42"
                })

                require "src.my-settings"

                assert.is_same("operator.ws2812 needs to be number between 0 and 10, but got \"42\"", MyLog.getWarnings()[1])
                assert.is_same(5, MySettings.operatorNumberOfWs2812Lights())
            end)
        end)
    end)

    insulate("stage.ws2812", function()
        insulate("should be 0 by default", function()
            it(function()
                mockSettings("settings-all.ini")
                require "src.my-settings"

                assert.is_same(0, MySettings.stageNumberOfWs2812Lights())
            end)
        end)
        insulate("should allow to set it", function()
            it(function()
                mockSettings("settings-all.ini", {
                    "stage.ws2812=2"
                })
                require "src.my-settings"

                assert.is_same(2, MySettings.stageNumberOfWs2812Lights())
            end)
        end)
        insulate("should log a warning on invalid string", function()
            it(function()
                mockSettings("settings-all.ini", {
                    "stage.ws2812=invalid"
                })

                require "src.my-settings"

                assert.is_same("stage.ws2812 needs to be number between 0 and 10, but got \"invalid\"", MyLog.getWarnings()[1])
                assert.is_same(0, MySettings.stageNumberOfWs2812Lights())
            end)
        end)
        insulate("should log a warning on negative number", function()
            it(function()
                mockSettings("settings-all.ini", {
                    "stage.ws2812=-2"
                })

                require "src.my-settings"

                assert.is_same("stage.ws2812 needs to be number between 0 and 10, but got \"-2\"", MyLog.getWarnings()[1])
                assert.is_same(0, MySettings.stageNumberOfWs2812Lights())
            end)
        end)
        insulate("should log a warning on number bigger as 10", function()
            it(function()
                mockSettings("settings-all.ini", {
                    "stage.ws2812=42"
                })

                require "src.my-settings"

                assert.is_same("stage.ws2812 needs to be number between 0 and 10, but got \"42\"", MyLog.getWarnings()[1])
                assert.is_same(0, MySettings.stageNumberOfWs2812Lights())
            end)
        end)
    end)
end)