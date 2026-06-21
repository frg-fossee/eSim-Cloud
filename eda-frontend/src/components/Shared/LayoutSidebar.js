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
export default function LayoutSidebar ({ window, mobileOpen, mobileClose, children, width = 250, onResize }) {
  const classes = useStyles()

  const handleMouseDown = (e) => {
    e.preventDefault()
    if (!onResize) return

    const startX = e.clientX
    const startWidth = width

    const handleMouseMove = (moveEvent) => {
      const newWidth = Math.max(180, Math.min(500, startWidth + (moveEvent.clientX - startX)))
      onResize(newWidth)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const container =
    window !== undefined ? () => window().document.body : undefined

  return (
    <>
      <nav className={classes.drawer} style={onResize ? { width } : undefined} aria-label="mailbox folders">
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
            PaperProps={onResize ? {
              style: { width }
            } : undefined}
            variant="permanent"
            open
          >
            {children}
            {onResize && (
              <div
                onMouseDown={handleMouseDown}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '6px',
                  cursor: 'col-resize',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.2s',
                  zIndex: 1300
                }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#ccc' }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent' }}
              />
            )}
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
