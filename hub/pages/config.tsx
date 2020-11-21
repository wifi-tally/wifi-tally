import { useState } from 'react'
import fetch from 'isomorphic-unfetch'
import {useSocket} from '../hooks/useSocket'
import Layout from '../components/Layout'

const mixerLabels = {
  mock: "Built-In Mock for testing",
  atem: "ATEM by Blackmagic Design",
  obs: "OBS Studio",
  vmix: "vMix",
  "null": "Off",
}

const Config = props => {
  const allowedMixers = props.allowedMixers
  const [currentMixerId, setCurrentMixerId] = useState(props.currentMixerId)
  const [atemIp, setAtemIp] = useState(props.atem.ip)
  const [atemPort, setAtemPort] = useState(props.atem.port)
  const [vmixIp, setVmixIp] = useState(props.vmix.ip)
  const [vmixPort, setVmixPort] = useState(props.vmix.port)
  const [obsIp, setObsIp] = useState(props.obs.ip)
  const [obsPort, setObsPort] = useState(props.obs.port)
  const [mockTickTime, setMockTickTime] = useState(props.mock.tickTime)
  const [mockChannelCount, setMockChannelCount] = useState(props.mock.channelCount)
  const [mockChannelNames, setMockChannelNames] = useState(props.mock.channelNames)

  const socket = useSocket('config', config => {
    setCurrentMixerId(config.currentMixerId)
    setAtemIp(config.atem.ip)
    setAtemPort(config.atem.port)
    setVmixIp(config.vmix.ip)
    setVmixPort(config.vmix.port)
    setObsIp(config.obs.ip)
    setObsPort(config.obs.port)
    setMockTickTime(config.mock.tickTime)
    setMockChannelCount(config.mock.channelCount)
    setMockChannelNames(config.mock.channelNames)
  })

  const handleSubmit = e => {
    socket.emit('config.changeRequest', currentMixerId, atemIp, atemPort, vmixIp, vmixPort, obsIp, obsPort, mockTickTime, mockChannelCount, mockChannelNames)
    e.preventDefault()
  }

  const addMixerOption = function(id) {
    const label = mixerLabels[id] || id
    return (
      <option key={id} value={id}>{label}</option>
    )
  }

  return (
    <Layout>
      <div className="page card">
        <h4 className="card-header">Video Mixer</h4>
        <div className="card-body">
          <p>
            Select a Video Mixer to use.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
            <select className="form-control" value={currentMixerId} onChange={e => setCurrentMixerId(e.target.value)}>
              {allowedMixers.map(addMixerOption)}
            </select>
          </div>
            {currentMixerId === "mock" ? (
              <fieldset>
                <legend>Mock Configuration</legend>
                <p className="text-muted">
                  This simulates a Video Mixer by changing the channels randomly at a fixed time interval.
                  It is intended for development, when you do not have a video mixer at hand, but serves
                  no purpose in productive environments.
                </p>
                <div className="form-group">
                  <label htmlFor="mock-tickTime">Change program every ms</label>
                  <input className="form-control" id="mock-tickTime" type="text" value={mockTickTime} onChange={e => setMockTickTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="mock-channelCount">Number of Channels</label>
                  <input className="form-control" id="mock-channelCount" type="text" value={mockChannelCount} onChange={e => setMockChannelCount(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="mock-channelNames">Channel Names</label>
                  <input className="form-control" id="mock-channelNames" type="text" value={mockChannelNames} onChange={e => setMockChannelNames(e.target.value)} />
                </div>
              </fieldset>
            ): ""}
            {currentMixerId === "atem" ? (
              <fieldset>
                <legend>ATEM Configuration</legend>
                <p className="text-muted">
                  Connects to any ATEM device over network.
                </p>
                <div className="form-group">
                  <label htmlFor="atem-ip">ATEM IP</label>
                  <input className="form-control" id="atem-ip" type="text" value={atemIp} onChange={e => setAtemIp(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="atem-port">ATEM Port</label>
                  <input className="form-control" id="atem-port" type="text" value={atemPort} onChange={e => setAtemPort(e.target.value)} />
                </div>
              </fieldset>
            ) : ""}
            {currentMixerId === "obs" ? (
              <fieldset>
                <legend>OBS Studio Configuration</legend>
                <p className="text-muted">
                  Connects to OBS Studio over network. The <a href="https://github.com/Palakis/obs-websocket" target="_blank">obs-websocket plugin</a> has to be installed.
                </p>
                <div className="form-group">
                  <label htmlFor="atem-ip">OBS Studio IP</label>
                  <input className="form-control" id="obs-ip" type="text" value={obsIp} onChange={e => setObsIp(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="atem-port">OBS Studio Port</label>
                  <input className="form-control" id="obs-port" type="text" value={obsPort} onChange={e => setObsPort(e.target.value)} />
                </div>
              </fieldset>
            ) : ""}
            {currentMixerId === "vmix" ? (
              <fieldset>
                <legend>vMix Configuration</legend>
                <p className="text-muted">
                  Connects to any vMix over network.
                </p>
                <div className="form-group">
                  <label htmlFor="vmix-ip">vMix IP</label>
                  <input className="form-control" id="vmix-ip" type="text" value={vmixIp} onChange={e => setVmixIp(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="vmix-port">vMix Port</label>
                  <input className="form-control" id="vmix-port" type="text" value={vmixPort} onChange={e => setVmixPort(e.target.value)} />
                </div>
              </fieldset>
            ) : ""}
            {currentMixerId === "null" ? (
              <fieldset>
                <p className="text-muted">This cuts the connection to any video mixer.</p>
              </fieldset>
            ) : ""}
            <button type="submit" className="btn btn-primary">Save</button>
          </form>
          </div>
      </div>
    </Layout>
  )
}

Config.getInitialProps = async (context) => {
  const baseUrl = context && context.req ? `${context.req.protocol}://${context.req.get('Host')}` : '';
  const response = await fetch(baseUrl + '/atem')
  const info = await response.json()

  return info
}

export default Config;