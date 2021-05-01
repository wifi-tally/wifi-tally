import net from 'net'
import xml2js from 'xml2js'
import midi from 'midi'
import { MixerCommunicator } from '../../lib/MixerCommunicator'
import { Connector } from '../interfaces'
import RolandV8HDConfiguration from './RolandV8HDConfiguration'

// @see https://static.roland.com/assets/media/pdf/V-8HD_reference_eng03_W.pdf
class RolandV8HDConnector implements Connector {
    configuration: RolandV8HDConfiguration
    communicator: MixerCommunicator
    queryInterval: number
    connected: boolean
    interval: any
    midi: any
    midi_input: any
    midi_output: any
    input_status: any

    constructor(configuration: RolandV8HDConfiguration, communicator: MixerCommunicator) {
        this.configuration = configuration
        this.communicator = communicator
        this.connected = false
        this.interval = null
        this.midi = midi
        this.input_status = [0,0,0,0,0,0,0,0]
    }

    connect() {
        console.log(`Connecting to RolandV8HD V-8HD via MIDI`)
        this.midi_input = new this.midi.Input()
        let inputPortCount = this.midi_input.getPortCount()
        // select correct port
        for(let i = 0; i < inputPortCount; i++){
          let name = this.midi_input.getPortName(i)
          if (name.includes("V-8HD")){
            this.midi_input.openPort(i)
            console.log(`Opened Midi Port ${i}: ${name}`)
            break
          }
        }

        this.midi_output = new this.midi.Output()
        let outputPortCount = this.midi_output.getPortCount()
        // select correct port
        for(let i = 0; i < outputPortCount; i++){
          let name = this.midi_output.getPortName(i)
          if (name.includes("V-8HD")){
            this.midi_output.openPort(i)
            console.log(`Opened Midi Output Port ${i}: ${name}`)
            break
          }
        }

        // do not ignore SysEx messages.
        this.midi_input.ignoreTypes(false, true, true);

        // Callback Method for Midi Input
        this.midi_input.on('message', (deltaTime, message) => {
          //Check tally parameter area
          if(message[8] == 12){
        		// hdmi input id in byte 11
        		let channel_idx = message[10]
        		// tally information in byte 12
        		let input_status = message[11]
            this.input_status[channel_idx] = input_status

            // only notify program status change after full iteration (8 chans)
            if(channel_idx == 7){
              this.processInputStatus(this.communicator)
            }
          }
        });

        this.interval = setInterval(this.checkRolandV8HDStatus, this.configuration.getRequestInterval(), this.communicator, this.midi_output)

        if(this.midi_input.isPortOpen() && this.midi_output.isPortOpen()){
          this.connected = true
          this.communicator.notifyMixerIsConnected()
        }else{
          console.log(`Cannot connect with RolandV8HD V-8HD. Please check connection and try again.`)
        }
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

    private checkRolandV8HDStatus(communicator: MixerCommunicator, midi_out: any){
      // Base SysEx message to RolandV8HD V-8HD
      let sysex_msg = [0xF0, 0x41,0x10,0x00,0x00,0x00,0x68,0x11,0x0C,0x00,0x00,0x00,0x00,0x03,0x71,0xF7]
      // iterate through all 8 input chans
    	for (let i = 0; i < 8; i++){
        if (midi_out){
          midi_out.sendMessage(sysex_msg)
          // increment input channel address
      		sysex_msg[10] += 1
          // decrement checksum by 1
      		sysex_msg[14] -= 1
        }
      }
    }

    disconnect() {
      //clean interval
      clearInterval(this.interval);
      console.log(`RolandV8HD V-8HD connection closed`);
      this.midi_output.closePort()
      this.midi_input.closePort()
      this.connected = false
      this.communicator.notifyMixerIsDisconnected()
      return true
    }

    isConnected() {
        return this.connected
    }

    static readonly ID: "rolandV8HD" = "rolandV8HD"
}

export default RolandV8HDConnector
