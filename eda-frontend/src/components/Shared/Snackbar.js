import React from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Snackbar
} from '@material-ui/core'
import { useDispatch } from 'react-redux'
import MuiAlert from '@material-ui/lab/Alert'

function Alert (props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}
// Schematic delete snackbar

export default function SimpleSnackbar ({ open, close, sch, confirmation }) {
  const dispatch = useDispatch()

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      open={open}
      autoHideDuration={6000}
      onClose={close}
    >
      <Alert
        icon={false}
        severity="warning"
        color="error"
        style={{ width: '100%' }}
        action={
          <>
            <Button
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => {
                dispatch(confirmation(sch.save_id))
              }}
            >
              Yes
            </Button>
            <Button
              size="small"
              aria-label="close"
              color="inherit"
              onClick={close}
            >
              NO
            </Button>
          </>
        }
      >
        {'Delete ' + sch.name + ' ?'}
      </Alert>
    </Snackbar>
  )
}

SimpleSnackbar.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  sch: PropTypes.object,
  confirmation: PropTypes.func
}
