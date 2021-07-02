import React from 'react'
import PropTypes from 'prop-types'
import './helper/Notice.css'
import {
  IconButton
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { SpinnerDotted } from 'spinners-react'

export function ScrollDialog (txt) {
  const [open, setOpen] = React.useState(true)
  const [scroll, setScroll] = React.useState('paper')

  const handleClickOpen = () => {
    setOpen(true)
    setScroll('paper')
  }

  const handleClose = () => {
    setOpen(false)
  }
  const descriptionElementRef = React.useRef(null)
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef
      if (descriptionElement !== null) {
        descriptionElement.focus()
      }
    }
  }, [open])

  return (
    <div>
      <Button onClick={handleClickOpen}>View More</Button>
      <Dialog
        maxWidth='md'
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title" classes={{ root: 'title' }}>Error Details</DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            {<pre>{txt.txt} </pre>}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
export default function Notice ({ status, msg, open, close }) {
  // open = true
  // status = 'success'
  const MAX_CHARS = 180
  const err = ((msg.length) > MAX_CHARS)
    ? msg.substring(0, MAX_CHARS) + '...'
    : msg.substring(0, MAX_CHARS)
  if (open === true) {
    switch (status) {
      case 'loading':
        return (
          <div>
            <div className="error-notice">
              <div className="notice warning">
                <SpinnerDotted size="25" thickness="100" color="#f0ad4e" />
                <strong> Loading...</strong>
              </div>
            </div>
          </div>
        )
      case 'success':
        return (
          <div>
            <div className="error-notice">
              <div className="notice success">
                <IconButton edge="start" size="small" color="inherit" onClick={close} aria-label="close">
                  <CloseIcon />
                </IconButton>
                <strong>Success</strong> - Simulation ran successfully!
              </div>
            </div>
          </div>
        )
      case 'error':
        return (
          <div>
            <div className="error-notice">
              <div className="notice danger">
                <IconButton edge="start" size="small" color="inherit" onClick={close} aria-label="close">
                  <CloseIcon />
                </IconButton>
                <strong>  Error</strong>- {err} <ScrollDialog txt={msg}/>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div></div>
        )
    }
  } else {
    return (<div></div>)
  }
}

Error.propTypes = {
  status: PropTypes.string,
  msg: PropTypes.string,
  close: PropTypes.func,
  open: PropTypes.bool
}
