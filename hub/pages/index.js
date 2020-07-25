import { useState } from 'react'
import fetch from 'isomorphic-unfetch'
import {useSocket, socketEventEmitter} from '../hooks/useSocket'
import Layout from '../components/Layout'
import Link from 'next/link'
import {BroadcastIcon, ServerIcon} from '@primer/octicons-react'


const Tally = require('../domain/Tally')

const countConnectedTallies = tallies =>
  tallies.reduce((count, tally) => count + (Tally.fromValueObject(tally).isConnected() ? 1 : 0), 0)

const createTallyList = (tallies, showDisconnected, showUnpatched) => {
  return tallies.map(
    tally => Tally.fromValueObject(tally)
  ).filter(
    tally => (tally.isActive() || showDisconnected) && (tally.isPatched() || showUnpatched)
  ).sort(
    (one, two) => {
      if (one.isActive() != two.isActive()) {
        return one.isActive() ? -1 : 1
      } else {
        return one.name.localeCompare(two.name)
      }
    }
  )
}

const ChatOne = props => {
  const [talliesData, setTallies] = useState(props.tallies || new Array())
  const [programs, setPrograms] = useState(props.programs || [])
  const [previews, setPreviews] = useState(props.previews || [])
  const [isMixerConnected, setIsMixerConnected] = useState(props.isMixerConnected || false)
  const [showDisconnected, setShowDisconnected] = useState(props.showDisconnected !== undefined ? props.showDisconnected : true)
  const [showUnpatched, setShowUnpatched] = useState(props.showUnpatched !== undefined ? props.showUnpatched : true)
  const [channels, setChannels] = useState(props.channels != undefined ? props.channels : {})

  const tallies = createTallyList(talliesData, showDisconnected, showUnpatched)

  const socket = useSocket('program.changed', data => {
    setPrograms(data.programs)
    setPreviews(data.previews)
  })

  useSocket('tallies', tallies => {
    setTallies(tallies)
  })
  useSocket('mixer', mixer => {
    setIsMixerConnected(mixer.isConnected)
  })
  useSocket('config', config => {
    setChannels(config.channels)
  })

  socketEventEmitter.on("connected", function() {
    console.log("connected")
  })

  socketEventEmitter.on("disconnected", function() {
    console.log("disconnected")
  })

  const patchTally = function(tally, channel) {
    socket.emit('tally.patch', tally.name, channel)
  }

  const toggleDisconnected = e => {
    setShowDisconnected(!showDisconnected)
  }

  const toggleUnpatched = e => {
    setShowUnpatched(!showUnpatched)
  }

  const handleHighlightTally = (e, tally) => {
    socket.emit('tally.highlight', tally.name)
    e.preventDefault()
  }

  const handleRemoveTally = (e, tally) => {
    socket.emit('tally.remove', tally.name)
    e.preventDefault()
  }

  const formatChannelOption = (idx, invalid) => {
    var label = "Channel " + idx
    if(channels.names[idx]) {
      label = channels.names[idx]
    }
    if(invalid) {
      label = "(" + label + ")"
    }
    return (<option value={idx} key={idx}>{label}</option>)
  }

  const format = tally => {
    var classPatched = "card "

    if(tally.state == Tally.DISCONNECTED) {
      classPatched += "bg-dark "
      if(!tally.isPatched()) {
        classPatched += "border-light "
      } else if(tally.isIn(programs)) {
        classPatched += "border-danger "
      } else if(tally.isIn(previews)) {
        classPatched += "border-success "
      } else {
        classPatched += "border-secondary "
      }
    } else {
      if(!tally.isPatched()) {
        classPatched += "bg-light "
      } else if(tally.isIn(programs)) {
        classPatched += "bg-danger "
      } else if(tally.isIn(previews)) {
        classPatched += "bg-success "
      } else {
        classPatched += "bg-secondary "
      }
    }
    return (
      <div key={tally.name} className={"tally " + classPatched}>
        <div className="card-header"><h6 className="card-title">{tally.name}</h6>
        {tally.isPatched() ? (
          <div className="card-bubble">{tally.channelId}</div>
        ) : "" }</div>
        <div className="card-body">
          <form>
            <div className="form-group">
            <select className="form-control" value={tally.channelId} onChange={e => patchTally(tally, e.target.value)}>
              <option value="-1">(unpatched)</option>
              {/* selection of all available channels */}
              {Array.from(Array(channels.count).keys()).map(i => i+1).map(idx => formatChannelOption(idx, false))}
              {tally.channelId > channels.count ? formatChannelOption(tally.channelId, true) : ""}
            </select>
            </div>
          </form>
          {tally.state != Tally.DISCONNECTED ? (
            <a href="#" className="card-link" onClick={e => handleHighlightTally(e, tally)}>Highlight</a>
          ) : ""}
          {tally.state != Tally.CONNECTED ? (
            <a href="#" className="card-link" onClick={e => handleRemoveTally(e, tally)}>Remove</a>
          ) : ""}
          <Link href="/tally/[tallyName]" as={`/tally/${tally.name}`}>
            <a className="card-link">Logs</a>
          </Link>
        </div>
        {tally.state == Tally.DISCONNECTED ? (
          <div className="card-footer">disconnected</div>
        ) : (         
          <div className={tally.state == Tally.MISSING ? "card-footer bg-warning" : "card-footer"}>
            <div className="card-footer-left">{tally.state == Tally.CONNECTED ? "connected" : "missing"}</div>
            <div className="card-footer-right text-muted">{tally.address}:{tally.port}</div>
          </div>
        )}
      </div>
    )
  }

  const nrConnectedTallies = countConnectedTallies(tallies)

  return (
    <Layout>
      <div>
        <div className="btn-group mb-2" role="group">
          <button type="button" className={"btn btn-sm " + (showDisconnected ? "btn-primary" : "btn-dark")} onClick={toggleDisconnected}>Show Disconnected</button>
          <button type="button" className={"btn btn-sm " + (showUnpatched ? "btn-primary" : "btn-dark")} onClick={toggleUnpatched}>Show Unpatched</button>
          <button type="button" className={"btn btn-secondary disabled"} title={"Video Mixer " + (isMixerConnected ? "connected" : "disconnected")}><ServerIcon /> {isMixerConnected ? 1 : 0}</button>
          <button type="button" className={"btn btn-secondary disabled"} title={nrConnectedTallies + " connected tallies"}><BroadcastIcon /> {nrConnectedTallies}</button>
        </div>
        <div id="tallies">
          {tallies.map(format)}
        </div>
      </div>
    </Layout>
  )
}

ChatOne.getInitialProps = async (context) => {
  const baseUrl = context && context.req ? `${context.req.protocol}://${context.req.get('Host')}` : '';
  const response = await fetch(baseUrl + '/tallies')
  const info = await response.json()
  // @TODO: use asynchronous calls
  const config = await fetch(baseUrl + '/atem')
  const configJson = await config.json()
  info.channels = configJson.channels

  return info
}

export default ChatOne;