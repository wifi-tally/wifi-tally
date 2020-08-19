# Tally

## tally-settings.ini Reference

| setting name | default | description |
| --- | --- | --- |
| `station.ssid` | **(required)** |The name of the WiFi that the Tally should connect to |
| `station.password` | (none) | The password to connect to the WiFi. If the WiFi has no password, leave it empty. |
| `hub.ip` | **(required)** | The IP address the hub is running on |
| `hub.port` | `{{ tally_default_port }}` | The port where the hub listens. |
| `tally.name` | (chip id) | How you want _this_ tally to be labeled in the hub. This name needs to be unique amongst all tallies in your network. It must not be longer than `26` characters. Use of ASCII characters is recommended. |
| `operator.type` | `grb+` | What type of RGB-LED strip is driven for the operator light. Use `grb+` for common anode and `grb-` for common cathode. |
| `stage.type` | `grb+` | What type of RGB-LED strip is driven for the stage light. Use `grb+` for common anode and `grb-` for common cathode. |
