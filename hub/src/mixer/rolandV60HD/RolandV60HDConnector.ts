import net from 'net'
import axios from 'axios'
import xml2js from 'xml2js'
import { MixerCommunicator } from '../../lib/MixerCommunicator'
import { Connector } from '../interfaces'
import RolandV60HDConfiguration from './RolandV60HDConfiguration'

// @see https://www.vmix.com/help20/index.htm?TCPAPI.html
class RolandV60HDConnector implements Connector {
    configuration: RolandV60HDConfiguration
    communicator: MixerCommunicator
    sourceConnections: any
    connected: boolean
    input_status: any

    constructor(configuration: RolandV60HDConfiguration, communicator: MixerCommunicator) {
        this.configuration = configuration
        this.communicator = communicator
        this.sourceConnections = []
        this.connected = false
        this.input_status = [0,0,0,0,0,0,0,0]
    }
    connect() {
        console.log(`Connecting to RolandV60HD at ${this.configuration.getIp().toString()}`)
        for(let i = 0; i < 8; i++){
          this.sourceConnections[i] = setInterval(function() {this.checkRolandV60HDStatus(this.communicator, this.configuration.getIp().toString(), i + 1)}.bind(this), this.configuration.getRequestInterval())
        }
        this.connected = true
    }

    private checkRolandV60HDStatus(communicator: MixerCommunicator, ip: string, address: number){
      axios.get(`http://${ip}/tally/${address.toString()}/status`)
        .then((response) => this.processResponse(response.data, address))
  		  .catch((error) => this.processResponseError(error));
    }

    private processResponse(response: string, address: number){
      if(!this.connected){
        this.connected = true
      }

      // RolandV60HD encodes tally states as words
      // unselected = off
      // onair = program
      // selected = preview
      switch(response){
        case "onair":
          this.input_status[address - 1] = 1
          //programs.push(`${address}`)
          break;
        case "selected":
          this.input_status[address - 1] = 2
          //previews.push(`${address}`)
          break;
        case "unselected":
          this.input_status[address - 1] = 0
          break;
        default:
          this.input_status[address - 1] = 0
          break;
      }
      // Only Process Tally Information after full iteration
      if(address == 8){
        this.processInputStatus(this.communicator)
      }
    }

    private processResponseError(error: any){
      console.log(`RolandV60HD Smart Tally Error: ${error}`)
      this.connected = false
    }

    private processInputStatus(communicator: MixerCommunicator){
      let programs: string[] = []
      let previews: string[] = []
      // iterate through input status array
      for(let i = 0; i < 8; i++){
        // process program
        if(this.input_status[i] == 1){
          programs.push(`${i + 1}`)
        }
        // process preview
        if(this.input_status[i] == 2){
          previews.push(`${i + 1}`)
        }
      }
      communicator.notifyProgramPreviewChanged(programs, previews)
    }

    disconnect() {
      //clean servers
      for(let i = 0; i < 8; i++){
        clearInterval(this.sourceConnections[i]);
      }
      console.log(`RolandV60HD Smart Tally connection closed`);
      this.connected = false
      return true
    }

    isConnected() {
        return this.connected
    }

    static readonly ID: "rolandV60HD" = "rolandV60HD"
}

export default RolandV60HDConnector
