import React from 'react'
import { AppBar, Button, Container, makeStyles, Toolbar } from '@material-ui/core';
import Link from 'next/link'


const useStyles = makeStyles(theme => {
  return {
    contentContainer: {
      marginTop: theme.spacing(2),
    },
  }
})

type LayoutProps = {
  children: React.ReactNode
}

const Layout = ({children}: LayoutProps) => {
  const classes = useStyles()
  return (<>
    <AppBar position="static">
      <Toolbar>
        <Link href="/" passHref>
          <Button>Tallies</Button>
        </Link>
        <Link href="/config" passHref>
          <Button>Configuration</Button>
        </Link>
      </Toolbar>
    </AppBar>
    <Container maxWidth={false} className={classes.contentContainer}>
      {children}
    </Container>
  </>)
}

export default Layout;