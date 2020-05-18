import React from 'react'
import PropTypes from 'prop-types'
import { IconButton } from '@material-ui/core'
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined'
import FolderIcon from '@material-ui/icons/Folder'
import EditIcon from '@material-ui/icons/Edit'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import UndoIcon from '@material-ui/icons/Undo'
import RedoIcon from '@material-ui/icons/Redo'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import ZoomOutIcon from '@material-ui/icons/ZoomOut'
import DeleteIcon from '@material-ui/icons/Delete'
import { makeStyles } from '@material-ui/core/styles'

import MenuButton from './MenuButton'

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginLeft: 'auto',
    padding: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    }
  },
  tools: {
    padding: theme.spacing(1),
    margin: theme.spacing(0, 0.5)
  }
}))

export default function SchematicToolbar ({ mobileClose }) {
  const classes = useStyles()

  return (
    <>
      <MenuButton iconType={FolderIcon} items={['New', 'Open', 'Save', 'Print', 'Export']} />
      <MenuButton iconType={EditIcon} items={['Cut', 'Copy', 'Paste']} />
      <MenuButton iconType={PlayArrowIcon} items={['DC Simulation', 'DC Sweep', 'Time Domain Simulation', 'Frequency Domain Simulation']} />

      <IconButton color="inherit" className={classes.tools} size="small">
        <UndoIcon fontSize="small" />
      </IconButton>
      <IconButton color="inherit" className={classes.tools} size="small">
        <RedoIcon fontSize="small" />
      </IconButton>
      <IconButton color="inherit" className={classes.tools} size="small">
        <ZoomInIcon fontSize="small" />
      </IconButton>
      <IconButton color="inherit" className={classes.tools} size="small">
        <ZoomOutIcon fontSize="small" />
      </IconButton>
      <IconButton color="inherit" className={classes.tools} size="small">
        <DeleteIcon fontSize="small" />
      </IconButton>
      <IconButton color="inherit" className={classes.tools} size="small">
        <HelpOutlineIcon fontSize="small" />
      </IconButton>

      <IconButton
        color='inherit'
        aria-label='open drawer'
        edge='end'
        size="small"
        onClick={mobileClose}
        className={classes.menuButton}
      >
        <AddBoxOutlinedIcon fontSize="small" />
      </IconButton>
    </>
  )
}

SchematicToolbar.propTypes = {
  mobileClose: PropTypes.func
}
