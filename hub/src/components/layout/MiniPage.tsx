import { Container, makeStyles, Paper, Typography } from '@material-ui/core'
import React from 'react'


const useStyles = makeStyles(theme => {
  return {
    root: {
      marginBottom: theme.spacing(2),
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
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
  addHeaderContent?: React.ReactNode
  contentPadding?: string
  children: React.ReactNode
}

function MiniPage({ title, addHeaderContent, contentPadding, children }: MiniPageProps) {
  const classes = useStyles({
    contentPadding
  })

  return(
    <Container className={classes.root} maxWidth="sm">
      <Paper>
        <div className={classes.header}>
          <Typography variant="h1">{title}</Typography>
          {addHeaderContent}
        </div>
        <div className={classes.content}>{children}</div>
      </Paper>
    </Container>
  )
}

export default MiniPage