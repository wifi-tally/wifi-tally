insulate("Log buffer", function()

    insulate("should buffer logs", function()
        it(function()
            local buffer = require "src.my-log-buffer"

            assert.is_false(buffer:hasLog())
            assert.is_nil(buffer:getLog())

            buffer:addLog(buffer.ERROR, "just a test")

            assert.is_true(buffer:hasLog())

            local severity, msg = buffer:getLog()
            assert.is_same(buffer.ERROR, severity)
            assert.is_same("just a test", msg)
            assert.is_false(buffer:hasLog())
            assert.is_nil(buffer:getLog())
        end)
    end)
    insulate("should maintain the order of logs", function()
        it(function()
            local buffer = require "src.my-log-buffer"

            buffer:addLog(buffer.INFO, "one")
            buffer:addLog(buffer.INFO, "two")
            buffer:addLog(buffer.INFO, "three")
            buffer:addLog(buffer.INFO, "four")

            local _, msg = buffer:getLog()
            assert.is_same("one", msg)
            local _, msg = buffer:getLog()
            assert.is_same("two", msg)
            local _, msg = buffer:getLog()
            assert.is_same("three", msg)
            local _, msg = buffer:getLog()
            assert.is_same("four", msg)
        end)
    end)
    insulate("should limit the number of logs and keep the newest", function()
        it(function()
            local buffer = require "src.my-log-buffer"

            for i=1, 20 do
                buffer:addLog(buffer.INFO, string.format("%d", i))
            end

            local _, msg = buffer:getLog()
            assert.is_same("11", msg)
        end)
    end)
    insulate("should discard info, then warning, then errors", function()
        it(function()
            local buffer = require "src.my-log-buffer"

            for i=1, 14 do
                local severity
                if i % 3 == 1 then
                    severity = buffer.INFO
                elseif i % 3 == 2 then
                    severity = buffer.WARN
                else
                    severity = buffer.ERROR
                end

                buffer:addLog(severity, string.format("%d", i))
            end

            local logs = {}

            while buffer:hasLog() do
                local _, msg = buffer:getLog()
                table.insert(logs, msg)
            end

            assert.is_same({"2", "3", "5", "6", "8", "9", "11", "12", "13", "14"}, logs)
        end)
    end)
    insulate("should limit the message length to avoid blocked memory", function()
        it(function()
            local buffer = require "src.my-log-buffer"

            local input = ""
            for _=1,10 do
                input = input .. "1234567890"
            end

            buffer:addLog(buffer.INFO, input)

            local _, msg = buffer:getLog()
            assert.is_same(80, msg:len())
        end)
    end)
end)