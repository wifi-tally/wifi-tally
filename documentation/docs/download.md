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


The latest version of vTally is [v{{ latest_version }}]({{ github_link }}/releases/tag/v{{ latest_version }}).

## Windows

### 1. Install Node.js ≥{{ hub_nodejs_version }}

[Install Node.js](https://nodejs.org/en/download/package-manager/).

Verify your installation

    $ node -v
    v14.15.4
    
    $ npm -v
    6.14.10

### 2. Install vTally

This command will install vTally globally for all users. Run

    npm install -g vtally:{{ latest_version }}

### 3. Run vTally

vTally is installed. Run it by calling

    C:\Users\account_name\AppData\Roaming\npm\node_modules\vtally

## Linux

### 1. Install Node.js ≥{{ hub_nodejs_version }}

[Install Node.js](https://nodejs.org/en/download/package-manager/) via your distribution's package manager.
It is likely you already have it installed.

Verify your installation

    $ node -v
    v14.15.4
    
    $ npm -v
    6.14.10

### 2. Install vTally

This command will install vTally globally for all users. Run

    sudo npm install -g vtally:{{ latest_version }} --unsafe-perm

!!! info
    The words `sudo` or `--unsafe-perm` might concern you. The line above is the typical way to install global npm
    packages with precompiled node extensions. You can read below for an alternative installation for one user.

### 3. Run vTally

vTally is installed. Run it by calling

    vtally

### Alternative installation for one user

You can install vTally – for one user only – through the following steps:

    npm config set prefix '~/.local/'
    echo 'export PATH=~/.local/bin/:$PATH' >> ~/.bashrc
    source ~/.bashrc
    npm install -g vtally:{{ latest_version }}
