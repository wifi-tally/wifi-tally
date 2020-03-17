LUAC?="luac.cross"
NODEMCU_TOOL?="nodemcu-tool"
BUSTED?="busted"

FILES=$(wildcard src/*.lua)
SOURCES=$(filter-out src/init.lua,$(FILES))
TARGETS=$(patsubst src/%.lua,out/%.lc,$(SOURCES))

.PHONY: test build flash flash-dev flash-prod clean unflash

test: build
	# if it compiles it is syntactically valid
	$(LUAC) -o /dev/null src/init.lua
	$(BUSTED)

out:
	mkdir -p out/
out/tally-settings.ini: tally-settings.ini out
	cp $< $@

out/init.lua: src/init.lua out
	cp $< $@

out/%.lc: src/%.lua out
	$(LUAC) -o $@ $<

build: $(TARGETS)

flash: flash-dev

flash-dev: build out/init.lua out/tally-settings.ini
	$(NODEMCU_TOOL) upload $(TARGETS) out/tally-settings.ini
	# prevent endless reboot
	$(NODEMCU_TOOL) remove init.lua
	$(NODEMCU_TOOL) upload --remotename _init.lua out/init.lua
	$(NODEMCU_TOOL) reset
	sleep 1
	$(NODEMCU_TOOL) terminal --run _init.lua

flash-prod: build out/init.lua out/tally-settings.ini
	$(NODEMCU_TOOL) remove _init.lua
	$(NODEMCU_TOOL) upload $(TARGETS) out/tally-settings.ini out/init.lua
	$(NODEMCU_TOOL) reset

clean:
	rm -rf out/

unflash:
	$(NODEMCU_TOOL) mkfs
