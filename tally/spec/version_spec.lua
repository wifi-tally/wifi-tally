it("The correct Lua version should be used for the tests so no unsupported language features are used", function()
    assert.is_same("Lua 5.1", _VERSION)
end)
