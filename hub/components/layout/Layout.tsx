import React from 'react'
import { AppBar, Button, Container, makeStyles, Toolbar, Typography } from '@material-ui/core';
import Link from 'next/link'


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
  children?: React.ReactNode
}

const Layout = ({children}: LayoutProps) => {
  const classes = useStyles()
  return (<>
    <AppBar position="static">
      <Toolbar>
        <Typography className={classes.logo} variant="h2">Tally Hub</Typography>
        <Link href="/" passHref>
          <Button>Tallies</Button>
        </Link>
        <Link href="/config" passHref>
          <Button>Configuration</Button>
        </Link>
      </Toolbar>
    </AppBar>
    { children && (<Container maxWidth={false} className={classes.contentContainer} children={children} />) }
  </>)
}

export default Layout;