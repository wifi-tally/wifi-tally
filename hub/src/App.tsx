import React from 'react'
import MyTheme from './components/layout/MyTheme'
import { CssBaseline } from '@material-ui/core'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import IndexPage from './pages/IndexPage'
import ConfigPage from './pages/ConfigPage'
import TallyLogPage from './pages/TallyLogPage'

function App() {
  return (
    <Router>
      <MyTheme>
        <CssBaseline />
        <Switch>
          <Route path="/tally/:tallyId/log">
            <TallyLogPage />
          </Route>
          <Route path="/config">
            <ConfigPage />
          </Route>
          <Route path="/">
            <IndexPage />
          </Route>
        </Switch>
      </MyTheme>
    </Router>
  )
}

export default App;
