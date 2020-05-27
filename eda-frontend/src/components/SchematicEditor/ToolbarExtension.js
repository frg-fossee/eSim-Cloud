import React from 'react'
import PropTypes from 'prop-types'
import {
  Slide,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextareaAutosize,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export function NetlistModal ({ open, close, netlist }) {
  return (
    <Dialog
      open={open}
      onClose={close}
      TransitionComponent={Transition}
      keepMounted
      aria-labelledby="generate-netlist"
      aria-describedby="generate-netlist-description"
    >
      <DialogTitle id="generate-netlist-title">{'Netlist Generator'}</DialogTitle>
      <DialogContent dividers>
        <DialogContentText id="generate-netlist-description">
          Current Netlist for given schematic...<br /><br />
          <TextareaAutosize aria-label="empty textarea" rowsMin={20} rowsMax={50} style={{ minWidth: '500px' }} value={netlist} />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="primary">
          Download
        </Button>
        <Button onClick={close} color="primary" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

NetlistModal.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  netlist: PropTypes.string
}

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative'
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1
  }
}))

export function HelpScreen ({ open, close }) {
  const classes = useStyles()
  return (
    <div>
      <Dialog fullScreen open={open} onClose={close} TransitionComponent={Transition}>
        <AppBar position="static" elevation={0} className={classes.appBar}>
          <Toolbar variant="dense" color="default">
            <IconButton edge="start" color="inherit" onClick={close} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Help - Keyboard Shorcuts
            </Typography>
            <Button autoFocus color="inherit" onClick={close}>
              close
            </Button>
          </Toolbar>
        </AppBar>
        <List>
          <ListItem divider>
            <ListItemText primary="UNDO" secondary="Ctrl + Z" />
          </ListItem>
          <ListItem divider>
            <ListItemText primary="REDO" secondary="Ctrl + A" />
          </ListItem>
          <ListItem divider>
            <ListItemText primary="ZOOM IN" secondary="Ctrl + I" />
          </ListItem>
          <ListItem divider>
            <ListItemText primary="ZOOM OUT" secondary="Ctrl + O" />
          </ListItem>
          <ListItem divider>
            <ListItemText primary="DEFAULT SIZE" secondary="Ctrl + Y" />
          </ListItem>
          <ListItem divider>
            <ListItemText primary="DELETE" secondary="Delete" />
          </ListItem>
        </List>
      </Dialog>
    </div>
  )
}

HelpScreen.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func
}
