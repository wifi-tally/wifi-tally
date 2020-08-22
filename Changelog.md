# TBD

* [BREAKING] location where the hub stores its configuration has been changed from `hub/config.json` to `$HOME/.wifi-tally.json` #21
* [BREAKING] Pins for Stage Light have been moved from `D2-D4` to `D1-D3`
* [BREAKING] The firmware is no longer part of the repository and will be built on Travis. If you need a firmware for development, get it from the latest release. #25
* [BREAKING] The firmware needs to be updated as the `ws2812` module was added
* [ADDED] allow the use of LEDs with common cathode #31
* [ADDED] allow the use of WS2812 strips, NeoPixel and the like #29

# v0.1-alpha4

* [FIXED] Compiled `lc` files in the release are working again. #24
* [ADDED] The hub shows indications if the video mixer is connected. #15

# v0.1-alpha3

* [BREAKING] The tallies name is trimmed to `26` characters.
* [BREAKING] Pinout of the tally was changed. See updated documentation. #5
* [FIXED] Following links on the hub is now possible when using the web interface on the machine that runs the hub #1
* [FIXED] Tally sanitizes its hostname if it contains spaces or is longer than 32 characters
* [ADDED] Tally logs the boot reason when starting. This could help determine if the tally crashed (which it never does of course ;) ) or the wifi signal was lost
* [ADDED] Tally buffers up to 10 log messages if the hub is not available. This helps detecting issues once the wifi connection is re-established.
* [ADDED] A separate LED can be used for the operator light on the tally #2
* [ADDED] the operator light is dimly glowing green when everything is connected, but the camera is neither on preview nor program. #7
* [ADDED] the NodeMCU onboard LED indicates if the board is powered and the code started
* [ADDED] Tally indicates if the settings.ini is invalid by blinking blue #11
* [CHANGED] Tally reconnects faster to wifi (`200ms`) when auth timed out, because it indicates low signal strength
* [CHANGED] Logs are better categorized as info, warning and error
