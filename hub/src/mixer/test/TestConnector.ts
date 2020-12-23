import express from 'express'
import { Server } from 'http'
import { MixerCommunicator } from "../../lib/MixerCommunicator"
import { Connector } from "../interfaces"
import TestConfiguration from "./TestConfiguration"

// a connector that exposes an API to simulate an arbitrary mixer used for testing
class TestConnector implements Connector {
    communicator: MixerCommunicator
    configuration: TestConfiguration
    server?: Server

    constructor(configuration: TestConfiguration, communicator: MixerCommunicator) {
        this.communicator = communicator
        this.configuration = configuration
    }
    connect() {
        const app = express()
        this.server = new Server(app)
        
        app.use(express.json())
        app.post('/state', (req, res) => {
            const {programs, previews} = req.body
            this.communicator.notifyProgramPreviewChanged(programs, previews)
            res.json("ok")
        })
      
        this.server.listen(this.configuration.getPort(), () => {
            console.log(`setting up a mixer for testing on port ${this.configuration.getPort()}`)
        })
    }
    disconnect() {
        this.server && this.server.close()
    }

    isConnected() {
        return this.server && this.server.listening
    }
    static readonly ID: "test" = "test"
}

export default TestConnector
