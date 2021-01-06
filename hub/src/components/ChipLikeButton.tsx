import { Button, ButtonProps, fade, lighten, makeStyles } from '@material-ui/core'
import React from 'react'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(0, 2),
    height: theme.spacing(4),
    borderRadius: theme.spacing(4) /2,
    textTransform: "none",
    fontWeight: "normal",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    fontSize: "0.8125rem",
  },
  contained: {
    color: theme.palette.common.white,
    backgroundColor: fade(theme.palette.common.white, 0.25),
    "&:hover, &:focus, &:active": {
      backgroundColor: fade(theme.palette.common.white, 0.4),
    }
  },
  containedPrimary: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main,
    "&:hover, &:focus, &:active": {
      backgroundColor: lighten(theme.palette.primary.main, 0.25),
    },
    "&.Mui-disabled": {
      backgroundColor: fade(theme.palette.primary.main, 0.4),
    },
  },
  containedSecondary: {
    color: theme.palette.getContrastText(theme.palette.secondary.main),
    backgroundColor: theme.palette.secondary.main,
    "&:hover, &:focus, &:active": {
      backgroundColor: lighten(theme.palette.secondary.main, 0.25),
    },
    "&.Mui-disabled": {
      backgroundColor: fade(theme.palette.secondary.main, 0.4),
    },
  }
}))

type ChipLikeButtonProps = {
  selected: boolean
} & ButtonProps

// A button that looks like a [Chip](https://material-ui.com/components/chips/#chip)
function ChipLikeButton(props: ChipLikeButtonProps) {
  const classes = useStyles()

  return (<Button data-selected={props.selected} variant="contained" disableElevation={true} color={props.selected ? "primary" : "default" } classes={classes} {...props} />)
}

export default ChipLikeButton