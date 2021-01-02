import { IconButton, Tooltip, ListItemIcon, ListItemText, Menu, MenuItem,  } from '@material-ui/core';
import React, { useState } from 'react'
import Tally from '../domain/Tally';
import SubjectIcon from '@material-ui/icons/Subject'
import DeleteIcon from '@material-ui/icons/Delete'
import HighlightIcon from '@material-ui/icons/Highlight'
import MoreIcon from '@material-ui/icons/MoreVert'
import LinkIcon from '@material-ui/icons/Link'
import { socket } from '../hooks/useSocket'
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom'

type TallyMenuProps = {
  tally: Tally
  className?: string
}

interface MenuItemLinkProps {
  children?: React.ReactNode;
  testid: string;
  to: string;
}

// @see https://material-ui.com/de/guides/composition/#list
function MenuItemLink(props: MenuItemLinkProps) {
  const { children, to, testid } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef<any, Omit<RouterLinkProps, 'to'>>((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to],
  );

  return (
    <li>
      <MenuItem data-testid={testid} component={renderLink} children={children} />
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

    socket.emit('tally.highlight', tally.name, tally.type)
    handleClose()
  }

  const handleRemoveTally = (e) => {
    e.preventDefault()
    if (!allowRemove) { return }

    socket.emit('tally.remove', tally.name, tally.type)
    handleClose()
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (<div data-testid={`tally-${tally.name}-menu`} className={className}>
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
      {tally.isWebTally() && (
        <MenuItemLink testid={`tally-${tally.name}-web`} to={`/tally/${tally.getId()}`}>
          <ListItemIcon><LinkIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Connect</ListItemText>
        </MenuItemLink>
      )}
      
      <MenuItemLink testid={`tally-${tally.name}-logs`} to={`/tally/${tally.getId()}/log`}>
        <ListItemIcon><SubjectIcon fontSize="small" /></ListItemIcon>
        <ListItemText>Logs</ListItemText>
      </MenuItemLink>
      <Tooltip data-testid={`tally-${tally.name}-highlight`} title={!allowHighlight ? "Tally is not connected" : ""}><div>
        <MenuItem component="div" disabled={!allowHighlight} onClick={handleHighlightTally}>
          <ListItemIcon><HighlightIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Highlight</ListItemText>
        </MenuItem>
      </div></Tooltip>
      <Tooltip data-testid={`tally-${tally.name}-remove`} title={!allowRemove ? "Connected Tallies can not be removed" : ""}><div>
        <MenuItem disabled={!allowRemove} onClick={handleRemoveTally}>
          <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Remove</ListItemText>
        </MenuItem>
      </div></Tooltip>
    </Menu>
  </div>)
}

export default TallyMenu