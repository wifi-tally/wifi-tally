# Installation

!!! warning
    We use [semantic versioning](https://semver.org/).
    
    This means
    
    * We believe the code is stable enough to be used for production
    * everything before version 1.0.0 could be changed at any time without prior notice.
      You should expect pinouts to change, features to dissapear, etc. with any upgrade
    * We maintain a changelog that will notify you of significant changes
    * Starting with version 1.0.0 the layout and features can be considered stable in a sense
      that they might be improved, but in a backward compatible way


The latest version of vTally is [{{ latest_version }}]({{ github_link }}/releases/tag/{{ latest_version }}).

## Windows

Download [vtally-{{ latest_version }}-win-x64-portable.exe]({{ github_link }}/releases/download/{{ latest_version }}/vtally-{{ latest_version }}-win-x64-portable.exe).

Windows Defender might complain multiple times, that it can not verify the source. Just be stubborn.

It does not require installation. Just double-click, and a tray icon should pop up. Right click and select
"Open in Browser", and you see the hub.

To exit vTally, right click the tray icon, click "Exit" and confirm.

### Autostart

Hit `WIN` + `R` on your keyboard and type `shell:Startup`. Move the exe file, you downloaded, into this directory.

When you restart your PC and log in again, vTally should automatically start.

## MacOS (x86_64)

Download [vtally-{{ latest_version }}-mac-x64.dmg]({{ github_link }}/releases/download/{{ latest_version }}/vtally-{{ latest_version }}-mac-x64.dmg).

To start the app, right click and select `open`.

A tray icon should pop up. Right click and select "Open in Browser", and you see the hub.

To exit vTally, right click the tray icon, click "Exit" and confirm.

## Linux (x86_64), Ubuntu, Debian, Fedora, etc.

Download [vtally-{{ latest_version }}-linux-x86_64.AppImage]({{ github_link }}/releases/download/{{ latest_version }}/vtally-{{ latest_version }}-linux-x86_64.AppImage),
open a terminal and make it executable:

````bash
chmod a+x vtally-{{ latest_version }}-linux-x86_64.AppImage
````

To start, run
````bash
./vtally-{{ latest_version }}-linux-x86_64.AppImage
````

Point your browser to <http://localhost:3000> to show the Hub.

Quit by tapping `CTRL` + `c` on your keyboard in the terminal window.


## Run from npm

### 1. Install Node.js ≥{{ hub_nodejs_version }}

[Install Node.js](https://nodejs.org/en/download/package-manager/).

Verify your installation. NodeJS should at least be at version {{ hub_nodejs_version }}. If this is not the
case, [check their website](https://nodejs.org/en/download/) for alternative ways of installation.

    $ node -v
    v14.15.4
    
    $ npm -v
    6.14.10

### 2. Install vTally

This command will install vTally for the logged-in user and does not require `sudo` rights. Run

````bash
npm config set prefix '~/.local/'
echo 'export PATH=~/.local/bin/:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g vtally:{{ latest_version }}
````

### 3. Run vTally

vTally is installed. Run it by calling

    vtally

This version does not come with the tray icon. Point your browser to <http://localhost:3000> to see the hub.
