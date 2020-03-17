-- buffer logs so they can be send to the hub
local maxBufferLength = 10
local maxStringLength = 80
local buffer = {}

local self = {
    ERROR = "ERROR",
    INFO = "INFO",
    WARN = "WARN",
}
local numericSeverity = function(severityString)
    if severityString == self.ERROR then
        return 2
    elseif severityString == self.WARN then
        return 1
    else
        return 0
    end
end

self.addLog = function(_, severity, msg)
    -- try to free space if buffer is full
    if #buffer >= maxBufferLength then
        -- the algorithm is, that when ever an item is pushed and the buffer is full,
        -- the oldest log with the lowest severity is pushed out.
        local targetSev = numericSeverity(severity)
        local idxToRemove = nil
        local lowestSeverity = nil
        for i, record in ipairs(buffer) do
            local otherSev = numericSeverity(record[1])
            if otherSev <= targetSev then
                if lowestSeverity == nil or otherSev < lowestSeverity then
                    idxToRemove = i
                    lowestSeverity = otherSev
                end
            end
        end
        if idxToRemove then
            table.remove(buffer, idxToRemove)
        end
        -- if no matching item has been found, discard the log
    end
    if #buffer < maxBufferLength then
        table.insert(buffer, {severity, msg:sub(0, maxStringLength)})
    end
end
self.hasLog = function(_)
    return #buffer > 0
end
self.getLog = function(_)
    local record = buffer[1]
    if record then
        table.remove(buffer, 1)

        return record[1], record[2]
    end
end

return self