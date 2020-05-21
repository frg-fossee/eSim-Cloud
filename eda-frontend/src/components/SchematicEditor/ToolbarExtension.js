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
  TextareaAutosize
} from '@material-ui/core'

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
          Current Netlist for given schematic...<br/><br/>
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
