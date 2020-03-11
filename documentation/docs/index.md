# Open Source Tally Light

Wifi Tally is an Open Source / Open Hardware Wifi Tally Light.

It aims to be affordable without sacrificing reliability and works with most
common video mixers.

![alt text](images/tally-hub.png "Tally Hub")

## Features

* WiFi Tally Light
* Hardware costs of about 10€
* flexible USB power (battery pack, camera outlet, stationary)
* Fast communication and lightweight protocol
* uses a Central Hub to communicate
* utilizes your local network and access points
* Open Source / Open Hardware

Currently only ATEM video mixers are supported, but please [open an issue](./issues)
if you want others to be supported too. It is really simple to integrate them
and the only reason they have not been integrated yet, is that nobody has needed it already. :D

## What you need

* NodeMCU Board with ESP8266
* a short piece of LED Strip (5V, 120LEDs/m, common Anode)
* a computer for production that can run a light weight NodeJs application
* a network, you can trust, with WiFi access spots