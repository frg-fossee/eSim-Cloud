import React from 'react'
import PropTypes from 'prop-types'
import { Drawer, Hidden, IconButton } from '@material-ui/core'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import { makeStyles } from '@material-ui/core/styles'

const drawerWidth = 250

const useStyles = makeStyles((theme) => ({
  drawer: {
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  drawerPaper: {
    width: drawerWidth
  }
}))

// Common layout left side pane for Dashboard and Schematic Editor
export default function LayoutSidebar ({ window, mobileOpen, mobileClose, children }) {
  const classes = useStyles()

  const container =
    window !== undefined ? () => window().document.body : undefined

  return (
    <>
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Hidden lgUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={mobileClose}
            classes={{
              paper: classes.drawerPaper
            }}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            <IconButton
              onClick={mobileClose}
              color="inherit"
              style={{ marginLeft: '190px' }}
            >
              <HighlightOffIcon />
            </IconButton>
            {children}
          </Drawer>
        </Hidden>

        <Hidden smDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper
            }}
            variant="permanent"
            open
          >
            {children}
          </Drawer>
        </Hidden>
      </nav>
    </>
  )
}

LayoutSidebar.propTypes = {
  window: PropTypes.object,
  mobileOpen: PropTypes.bool.isRequired,
  mobileClose: PropTypes.func.isRequired,
  children: PropTypes.element
}
