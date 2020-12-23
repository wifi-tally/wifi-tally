import { IconButton, Tooltip, ListItemIcon, ListItemText, Menu, MenuItem,  } from '@material-ui/core';
import React, { useState } from 'react'
import Tally from '../domain/Tally';
import SubjectIcon from '@material-ui/icons/Subject'
import DeleteIcon from '@material-ui/icons/Delete'
import HighlightIcon from '@material-ui/icons/Highlight'
import MoreIcon from '@material-ui/icons/MoreVert'
import { socket } from '../hooks/useSocket'
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom'

type TallyMenuProps = {
  tally: Tally
  className?: string
}

interface MenuItemLinkProps {
  children?: React.ReactNode;
  to: string;
  onClick: () => void
}

// @see https://material-ui.com/de/guides/composition/#list
function MenuItemLink(props: MenuItemLinkProps) {
  const { children, to, onClick } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef<any, Omit<RouterLinkProps, 'to'>>((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to],
  );

  return (
    <li>
      <MenuItem component={renderLink} children={children} />
    </li>
  );
}

function TallyMenu({ tally, className }: TallyMenuProps) {
  const [anchorEl, setAnchorEl] = useState(null)
  const allowHighlight = tally.isActive()
  const allowRemove = !tally.isConnected()

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleHighlightTally = (e) => {
    e.preventDefault()
    if (!allowHighlight) { return }

    socket.emit('tally.highlight', tally.name)
    handleClose()
  }

  const handleRemoveTally = (e) => {
    e.preventDefault()
    if (!allowRemove) { return }

    socket.emit('tally.remove', tally.name)
    handleClose()
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (<div className={className}>
    <IconButton size="small" title={`${tally.name} Menu`} aria-controls="menu" aria-haspopup="true" onClick={handleMenuClick}>
      <MoreIcon />
    </IconButton>
    <Menu
      id="menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      <MenuItemLink to={`/tally/${tally.name}`} onClick={handleClose}><>
        <ListItemIcon><SubjectIcon fontSize="small" /></ListItemIcon>
        <ListItemText>Logs</ListItemText>
      </></MenuItemLink>
      <Tooltip title={!allowHighlight ? "Tally is not connected" : ""}><div>
        <MenuItem component="div" disabled={!allowHighlight} onClick={handleHighlightTally}>
          <ListItemIcon><HighlightIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Highlight</ListItemText>
        </MenuItem>
      </div></Tooltip>
      <Tooltip title={!allowRemove ? "Connected Tallies can not be removed" : ""}><div>
        <MenuItem disabled={!allowRemove} onClick={handleRemoveTally}>
          <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Remove</ListItemText>
        </MenuItem>
      </div></Tooltip>
    </Menu>
  </div>)
}

export default TallyMenu