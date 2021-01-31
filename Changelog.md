# v0.4.0

**IMPORTANT**: Code on the Tally **HAS** changed. Tallies and the Hub will not be able to communicate
unless you also update the `.lc` files on the Tallies.

* [BREAKING] The protocol between Tally and Hub has been modified. The hub now sends specific information on what colors to show. This step was necessary because we reached the memory limit on NodeMCU with the newly added features.
* [ADDED] Tallies can use a pink-yellow color scheme to be better distinguishable for people with a red-green weakness (Protanopia, Deuteranopia)
* [ADDED] Tallies can be dimmed and the stage light can be turned off completely
* [ADDED] Tallies have an option to hide preview state on the stage light.
* [ADDED] All of the settings above can be changed for ALL Tallies or on a per-Tally basis.
* [ADDED] OBS support to only show on-air status when actually recording or streaming. The Tally Lights will show up as "in preview" when this is not the case.

# v0.3.0

A feature release.

Code on the Tally did not change. If you are doing an upgrade there is no need to
modify the Tallies.

* [ADDED] The Hub allows to turn any device with a browser into a Tally Light ("Web Tally")
* [CHANGED] We recommend updating Node.js to version `14`. The hub will still run with Node.js `12` in the foreseeable future though.
* [CHANGED] Documentation has been cleaned up and the Getting Started Guide has a different order now

# v0.2.1

* [BUGFIX] Tallies and their configuration are stored again

# v0.2.0

There have been numerous technical changes on the hub and the way the release
is built under the hood. One of the results is, that the release packages are now
significantly smaller. We made sure that nothing broke, but if you spot anything
please report it.

Code on the Tally did not change. If you are doing an upgrade there is no need to
modify the Tallies.

* [ADDED] Support for OBS added #27
* [CHANGED] the release size has been reduced significantly. This should speed up download and extraction by a magnitude
* [CHANGED] replaced the UI framework (from bootstrap to MaterialUI). There are some minor changes in the UI, but the general flow stayed the same
* [CHANGED] npm dependencies of the hub updated
* [OTHER] TravisCI, the service we used to build the release packages, has basically discontinued its Open Source support. So the release is now built with Github Actions. This is nothing that you would see when using the software, but still worth mentioning.

# v0.1.0

* [BREAKING] location where the hub stores its configuration has been changed from `hub/config.json` to `$HOME/.wifi-tally.json` #21
* [BREAKING] Pins for Stage Light have been moved from `D2-D4` to `D1-D3`
* [BREAKING] The firmware is no longer part of the repository and will be built on Travis. If you need a firmware for development, get it from the latest release. #25
* [BREAKING] The firmware needs to be updated as the `ws2812` module was added
* [FIXED] prevent hub from crashing on invalid message #19
* [FIXED] hub does boot even if the configuration is empty
* [ADDED] Support for vMix added #12
* [ADDED] the hub does not use generic channel names (like `Channel 1`) if the video mixer has a name configured
* [ADDED] the channel drop-down in the hub is limited to the number of channels supported by the video mixer
* [ADDED] the web page shows if it has lost connection to the hub and reloads #20
* [ADDED] allow the use of LEDs with common cathode #31
* [ADDED] allow the use of WS2812 strips, NeoPixel and the like #29
* [ADDED] better log if it looks as if Atem rejected a connection #16
* [CHANGED] use cross-env to allow hub to run on windows #18
* [CHANGED] npm dependencies of the hub updated
* [CHANGED] firmware version of the tally updated
* [CHANGED] tallies that are not patched in the hub now do not show the "video mixer not connected" error

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
