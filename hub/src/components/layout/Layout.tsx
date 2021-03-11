import React from 'react'
import { AppBar, Button, Container, makeStyles, Toolbar, Typography } from '@material-ui/core'
import { Link as RouterLink } from 'react-router-dom'

const useStyles = makeStyles(theme => {
  return {
    logo: {
      marginRight: theme.spacing(2),
    },
    contentContainer: {
      marginTop: theme.spacing(2),
    },
  }
})

type LayoutProps = {
  testId: string // this makes it easy in cypress to determine on which page we are
  children?: React.ReactNode
}

const Layout = ({testId: cypressId, children}: LayoutProps) => {
  const classes = useStyles()

  return (<div data-testid={`page-${cypressId}`}>
    <AppBar position="static">
      <Toolbar>
        <Typography className={classes.logo} variant="h2">Tally Hub</Typography>
        <Button component={RouterLink} to="/">Tallies</Button>
        <Button component={RouterLink} to="/config">Configuration</Button>
        <Button component={RouterLink} to="/flasher">Flash</Button>
      </Toolbar>
    </AppBar>
    { children && (<Container maxWidth={false} className={classes.contentContainer} children={children} />) }
  </div>)
}

export default Layout;