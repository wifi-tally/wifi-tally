import { Container, makeStyles, Paper, Typography } from '@material-ui/core'
import React from 'react'


const useStyles = makeStyles(theme => {
  return {
    root: {
      marginBottom: theme.spacing(2),
    },
    header: {
      padding: theme.spacing(1, 2),
      borderBottom: "1px solid " + theme.palette.background.default,
    },
    content: (props: any) => ({
      padding: theme.spacing(2, props.contentPadding || 2),
    })
  }
})

type MiniPageProps = {
  title?: string,
  contentPadding?: string
  children: React.ReactNode
}

function MiniPage({ title, contentPadding, children }: MiniPageProps) {
  const classes = useStyles({
    contentPadding
  })

  return(
    <Container className={classes.root} maxWidth="sm">
      <Paper>
        <Typography variant="h1" className={classes.header}>{title}</Typography>
        <div className={classes.content}>{children}</div>
      </Paper>
    </Container>
  )
}

export default MiniPage