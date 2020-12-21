import { useState } from 'react'
import useSocketInfo from '../hooks/useSocketInfo'
import useMixerInfo from '../hooks/useMixerInfo'
import Layout from '../components/Layout'
import {BroadcastIcon, ServerIcon, DeviceDesktopIcon} from '@primer/octicons-react'
import Tally from '../domain/Tally'
import useTallies from '../hooks/useTallies'
import TallyComponent from '../components/Tally'

const countConnectedTallies = tallies => {
  if(!tallies) { return null }
  return tallies.reduce((count, tally) => count + (Tally.fromJson(tally).isConnected() ? 1 : 0), 0)
}

const createTallyList = (tallies, showDisconnected, showUnpatched) => {
  if(!tallies) { return null }
  return tallies.filter(
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

const IndexPage = () => {
  const rawTallies = useTallies()
  const [showDisconnected, setShowDisconnected] = useState(true)
  const [showUnpatched, setShowUnpatched] = useState(true)
  const isMixerConnected = useMixerInfo()
  const isHubConnected = useSocketInfo()

  const tallies = createTallyList(rawTallies, showDisconnected, showUnpatched)

  const toggleDisconnected = e => {
    setShowDisconnected(!showDisconnected)
  }

  const toggleUnpatched = e => {
    setShowUnpatched(!showUnpatched)
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
          <button type="button" className={"btn btn-secondary disabled"} title={nrConnectedTallies + " connected tallies"}><BroadcastIcon /> {nrConnectedTallies === null ? "?" : nrConnectedTallies}</button>
        </div>
        { isHubConnected ? "" : (
          <div className="alert alert-danger">
            <h4 className="alert-heading">Hub disconnected</h4>
            <p>The displayed information might be outdated.</p>
            <p>We will try to reconnect automatically, but you might also try to <a href="#" onClick={refreshPage}>reload the page</a>.</p>
          </div>
        )}
        <div id="tallies">
          {tallies ? tallies.map(tally => <TallyComponent tally={tally} />) : "" /* @TODO: loading */}
        </div>
      </div>
    </Layout>
  )
}

export default IndexPage;