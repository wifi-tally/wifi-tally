# WiFi Tally Hub

This is the code that runs on a computer in your network and communicates with 
your video mixer and the Tallies. It also offers a web interface for monitoring
and configuration.

[Full documentation at wifi-tally.github.io](https://wifi-tally.github.io/)

## Development setup

### Overview

The code consists of two parts

* The **backend**, a nodeJS application
* The **frontend**, built with ReactJS

Both share some of the code and live in the same directory structure.

### Run the development setup

Both parts, _frontend_ and _backend_, have to be started. During development the _backend_
proxies requests to the _frontend_.

    npm install --also=dev

    # in one terminal
    npm run start:frontend

    # in another terminal
    npm run start:backend

Point your browser to http://localhost:3000

### Run tests

Before pushing you should run the tests with

    npm run test

### Editor

Use of [Visual Studio Code](https://code.visualstudio.com/) with the following extensions is recommended:

* ESLint

#### Troubleshoot "Cannot use JSX unless the '--jsx' flag is provided"

    Cannot use JSX unless the '--jsx' flag is provided

VS Code might underline most of the inputs red and complain with the above message

The [solution](https://stackoverflow.com/a/64976666)
is to [make VS Code use the workspace's version of Typescript](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript).

## Concepts

### Sockets

Frontend-Backend communication is done through a websocket. It is the default way of sharing data and should be preferred over
an HTTP API or similar.
