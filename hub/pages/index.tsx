import { useState } from 'react'
import fetch from 'isomorphic-unfetch'
import {useSocket, socketEventEmitter, socket} from '../hooks/useSocket'
import useSocketInfo from '../hooks/useSocketInfo'
import useMixerInfo from '../hooks/useMixerInfo'
import Layout from '../components/Layout'
import Link from 'next/link'
import Channel from '../domain/Channel'
import {BroadcastIcon, ServerIcon, DeviceDesktopIcon} from '@primer/octicons-react'
import ChannelSelector from '../components/ChannelSelector'
import useProgramPreview from '../hooks/useProgramPreview'
import Tally from '../domain/Tally'

const countConnectedTallies = tallies =>
  tallies.reduce((count, tally) => count + (Tally.fromValueObject(tally).isConnected() ? 1 : 0), 0)

const createTallyList = (tallies, showDisconnected, showUnpatched) => {
  return tallies.map(
    tally => Tally.fromValueObject(tally)
  ).filter(
    tally => (tally.isActive() || showDisconnected) && (tally.isPatched() || showUnpatched)
  ).sort(
    (one, two) => {
      if (one.isActive() !== two.isActive()) {
        return one.isActive() ? -1 : 1
      } else {
        return one.name.localeCompare(two.name)
      }
    }
  )
}

const IndexPage = props => {
  const [talliesData, setTallies] = useState(props.tallies || new Array())
  const [showDisconnected, setShowDisconnected] = useState(props.showDisconnected !== undefined ? props.showDisconnected : true)
  const [showUnpatched, setShowUnpatched] = useState(props.showUnpatched !== undefined ? props.showUnpatched : true)
  const [channels, setChannels] = useState(props.channels !== undefined ? props.channels : [])
  const isMixerConnected = useMixerInfo()
  const isHubConnected = useSocketInfo()
  const [programs, previews] = useProgramPreview()

  const tallies = createTallyList(talliesData, showDisconnected, showUnpatched)

  useSocket('tallies', tallies => {
    setTallies(tallies)
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

  const format = tally => {
    let classPatched = "card "

    if(tally.isActive()) {
      if(!tally.isPatched()) {
        classPatched += "bg-light "
      } else if(tally.isIn(programs)) {
        classPatched += "bg-danger "
      } else if(tally.isIn(previews)) {
        classPatched += "bg-success "
      } else {
        classPatched += "bg-secondary "
      }
    } else {
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
              <ChannelSelector className="form-control" defaultSelect={tally.channelId} channels={channels} onChange={value => patchTally(tally, value)} />
            </div>
          </form>
          {tally.isActive() ? (
            <a href="#" className="card-link" onClick={e => handleHighlightTally(e, tally)}>Highlight</a>
          ) : ""}
          {!tally.isConnected() ? (
            <a href="#" className="card-link" onClick={e => handleRemoveTally(e, tally)}>Remove</a>
          ) : ""}
          <Link href="/tally/[tallyName]" as={`/tally/${tally.name}`}>
            <a className="card-link">Logs</a>
          </Link>
        </div>
        {tally.isActive() ? (
          <div className={tally.isMissing() ? "card-footer bg-warning" : "card-footer"}>
            <div className="card-footer-left">{tally.isMissing() ? "missing" : "connected"}</div>
            <div className="card-footer-right text-muted">{tally.address}:{tally.port}</div>
          </div>
        ):(
          <div className="card-footer">disconnected</div>
        )}
      </div>
    )
  }

  const nrConnectedTallies = countConnectedTallies(tallies)

  function refreshPage() {
    window.location.reload(false)
    return false
  }

  return (
    <Layout>
      <div>
        <div className="btn-group mb-2" role="group">
          <button type="button" className={"btn btn-sm " + (showDisconnected ? "btn-primary" : "btn-dark")} onClick={toggleDisconnected}>Show Disconnected</button>
          <button type="button" className={"btn btn-sm " + (showUnpatched ? "btn-primary" : "btn-dark")} onClick={toggleUnpatched}>Show Unpatched</button>
          <button type="button" className={"btn btn-secondary disabled"} title={"Hub " + (isHubConnected ? "connected" : "disconnected")}><DeviceDesktopIcon /> {isHubConnected ? 1 : 0}</button>
          <button type="button" className={"btn btn-secondary disabled"} title={"Video Mixer " + (isMixerConnected ? "connected" : "disconnected")}><ServerIcon /> {isMixerConnected ? 1 : 0}</button>
          <button type="button" className={"btn btn-secondary disabled"} title={nrConnectedTallies + " connected tallies"}><BroadcastIcon /> {nrConnectedTallies}</button>
        </div>
        { isHubConnected ? "" : (
          <div className="alert alert-danger">
            <h4 className="alert-heading">Hub disconnected</h4>
            <p>The displayed information might be outdated.</p>
            <p>We will try to reconnect automatically, but you might also try to <a href="#" onClick={refreshPage}>reload the page</a>.</p>
          </div>
        )}

        <div id="tallies">
          {tallies.map(format)}
        </div>
      </div>
    </Layout>
  )
}

IndexPage.getInitialProps = async (context) => {
  const baseUrl = context && context.req ? `${context.req.protocol}://${context.req.get('Host')}` : '';
  const response = await fetch(baseUrl + '/tallies')
  const info = await response.json()
  // @TODO: use asynchronous calls
  const config = await fetch(baseUrl + '/atem')
  const configJson = await config.json()
  info.channels = configJson.channels.map(c => Channel.fromJson(c))

  return info
}

export default IndexPage;