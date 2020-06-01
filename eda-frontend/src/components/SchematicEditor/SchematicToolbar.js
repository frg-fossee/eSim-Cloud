import React from 'react'
import PropTypes from 'prop-types'
import { IconButton, Tooltip } from '@material-ui/core'
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined'
import FolderIcon from '@material-ui/icons/Folder'
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import UndoIcon from '@material-ui/icons/Undo'
import RedoIcon from '@material-ui/icons/Redo'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import ZoomOutIcon from '@material-ui/icons/ZoomOut'
import DeleteIcon from '@material-ui/icons/Delete'
import SettingsOverscanIcon from '@material-ui/icons/SettingsOverscan'
import PrintOutlinedIcon from '@material-ui/icons/PrintOutlined'
import BugReportOutlinedIcon from '@material-ui/icons/BugReportOutlined'
import RotateRightIcon from '@material-ui/icons/RotateRight'
import BorderClearIcon from '@material-ui/icons/BorderClear'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'

import { NetlistModal, HelpScreen } from './ToolbarExtension'
import MenuButton from './MenuButton'
import { ZoomIn, ZoomOut, ZoomAct, DeleteComp, PrintPreview, ErcCheck, Rotate, GenerateNetList, Undo, Redo, Save } from './Helper/ToolbarTools'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSimulate, closeCompProperties } from '../../redux/actions/index'

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginLeft: 'auto',
    marginRight: theme.spacing(0),
    padding: theme.spacing(1),
    [theme.breakpoints.up('lg')]: {
      display: 'none'
    }
  },
  tools: {
    padding: theme.spacing(1),
    margin: theme.spacing(0, 0.5),
    color: '#262626'
  },
  pipe: {
    fontSize: '1.45rem',
    color: '#d6c4c2',
    margin: theme.spacing(0, 1.5)
  }
}))

export default function SchematicToolbar ({ mobileClose }) {
  const classes = useStyles()
  const netfile = useSelector(state => state.netlistReducer)

  const dispatch = useDispatch()

  const [open, setOpen] = React.useState(false)
  const [helpOpen, setHelpOpen] = React.useState(false)
  const [netlist, genNetlist] = React.useState('')

  const handleClickOpen = () => {
    var compNetlist = GenerateNetList()
    var netlist = netfile.title + '\n' +
      netfile.model + '\n' +
      compNetlist + '\n' +
      netfile.controlLine + '\n' +
      netfile.controlBlock + '\n'
    genNetlist(netlist)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleHelpOpen = () => {
    setHelpOpen(true)
  }

  const handleHelpClose = () => {
    setHelpOpen(false)
  }

  const handleDeleteComp = () => {
    DeleteComp()
    dispatch(closeCompProperties())
  }

  return (
    <>
      <MenuButton title={'File'} iconType={FolderIcon} items={['New', 'Open', 'Save', 'Print', 'Export']} />
      <Tooltip title="Save">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={Save} >
          <SaveIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Simulate">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={() => { dispatch(toggleSimulate()) }}>
          <PlayCircleOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <span className={classes.pipe}>|</span>

      <Tooltip title="Undo">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={Undo}>
          <UndoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Redo">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={Redo}>
          <RedoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Rotate">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={Rotate}>
          <RotateRightIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <span className={classes.pipe}>|</span>

      <Tooltip title="Zoom In">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={ZoomIn}>
          <ZoomInIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Zoom Out">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={ZoomOut}>
          <ZoomOutIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Default Size">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={ZoomAct}>
          <SettingsOverscanIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <span className={classes.pipe}>|</span>

      <Tooltip title="Print Preview">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={PrintPreview}>
          <PrintOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Generate Netlist">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={handleClickOpen} >
          <BorderClearIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <NetlistModal open={open} close={handleClose} netlist={netlist} />
      <Tooltip title="ERC Check">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={ErcCheck}>
          <BugReportOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <span className={classes.pipe}>|</span>

      <Tooltip title="Delete">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={handleDeleteComp}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Help">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={handleHelpOpen}>
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <HelpScreen open={helpOpen} close={handleHelpClose} />

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
