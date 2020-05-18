import React from 'react'
import PropTypes from 'prop-types'
import { IconButton } from '@material-ui/core'
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginLeft: 'auto',
    padding: theme.spacing(0.5),
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    }
  }
}))

export default function SchematicToolbar ({ mobileClose }) {
  const classes = useStyles()

  return (
    <>
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
