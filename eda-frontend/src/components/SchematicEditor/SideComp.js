import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import {
  List, ListItemText, Tooltip, Popover,
  Button, Snackbar, IconButton
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import api from '../../utils/Api'
import CloseIcon from '@material-ui/icons/Close'
import StarIcon from '@material-ui/icons/Star'
import StarBorderIcon from '@material-ui/icons/StarBorder'

import './Helper/SchematicEditor.css'
import { AddComponent } from './Helper/SideBar.js'

const useStyles = makeStyles((theme) => ({
  popupInfo: {
    margin: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    border: '1px solid blue',
    borderRadius: '5px'
  },
  compWrapper: {
    position: 'relative',
    display: 'inline-block'
  },
  starBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 2,
    zIndex: 2,
    background: 'rgba(255,255,255,0.75)',
    borderRadius: '50%',
    '&:hover': {
      background: 'rgba(255,255,255,0.95)'
    }
  },
  starIconOn: {
    fontSize: 14,
    color: '#f4b400'
  },
  starIconOff: {
    fontSize: 14,
    color: '#9e9e9e'
  }
}))

// ─── Fix #2: useRef (not createRef) so the ref is stable across re-renders ───
// ─── Fix #7: removed dead `isFavourite` prop — isStarred() is the source of truth ───
export default function SideComp ({ favourite, setFavourite, component }) {
  const classes = useStyles()
  const imageRef = useRef(null)           // Fix #2: was React.createRef()

  const [anchorEl, setAnchorEl] = React.useState(null)

  // Fix #13: unified snackbar state — replaces the two-effect pattern
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '' })

  // Fix #3: in-flight guard prevents double-click race condition
  const [favLoading, setFavLoading] = React.useState(false)

  const showSnackbar = (message) => setSnackbar({ open: true, message })
  const closeSnackbar = (_, reason) => {
    if (reason === 'clickaway') return
    setSnackbar((s) => ({ ...s, open: false }))
  }

  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  useEffect(() => {
    // Make component thumbnail draggable onto the mxGraph canvas
    AddComponent(component, imageRef.current)
    // eslint-disable-next-line
  }, [])

  // Returns true when this component is already in the user's favourites list
  const isStarred = () => {
    if (!favourite || !Array.isArray(favourite)) return false
    return favourite.some((fav) => fav.id === component.id)
  }

  const addFavourite = (id) => {
    if (favLoading) return                          // Fix #3: guard against double-click
    setFavLoading(true)

    const token = localStorage.getItem('esim_token')
    const body = { component: [id] }
    const config = { headers: { 'Content-Type': 'application/json' } }
    if (token) config.headers.Authorization = `Token ${token}`

    api.post('favouritecomponents', body, config)
      .then((resp) => {
        const updated = resp?.data?.component ?? [] // Fix #5: null-safe access with fallback
        setFavourite(updated)
        showSnackbar('Component added to favourites')
      })
      .catch((err) => {
        console.error('[Favourites] add failed:', err.message || err) // Fix #6: console.error
        showSnackbar('Failed to update favourites')
      })
      .finally(() => setFavLoading(false))          // Fix #3: always reset loading flag

    setAnchorEl(null)
  }

  // Fix #11: simplified — uses isStarred() instead of the old var/flag loop
  const handleFavourite = (id) => {
    if (isStarred()) {
      showSnackbar('This component is already added to favourites')
      setAnchorEl(null)
    } else {
      addFavourite(id)
    }
  }

  const handleRemove = (id) => {
    if (favLoading) return                          // Fix #3: guard against double-click
    setFavLoading(true)

    const token = localStorage.getItem('esim_token')
    const config = { headers: { 'Content-Type': 'application/json' } }
    if (token) config.headers.Authorization = `Token ${token}`

    api.delete(`favouritecomponents/${id}`, config)
      .then((resp) => {
        const updated = resp?.data?.component ?? [] // Fix #5: null-safe access with fallback
        setFavourite(updated)
        showSnackbar('Removed from favourites')
      })
      .catch((err) => {
        console.error('[Favourites] remove failed:', err.message || err) // Fix #6: console.error
        showSnackbar('Failed to update favourites')
      })
      .finally(() => setFavLoading(false))          // Fix #3: always reset loading flag

    setAnchorEl(null)
  }

  // One-click star toggle on thumbnail — bypasses the info popover
  const handleStarToggle = (e) => {
    e.stopPropagation()
    if (!localStorage.getItem('esim_token')) return
    if (isStarred()) {
      handleRemove(component.id)
    } else {
      addFavourite(component.id)
    }
  }

  return (
    <div>
      {/* Wrapper gives the star IconButton an absolute-position anchor */}
      <div className={classes.compWrapper}>
        <Tooltip title={component.full_name + ' : ' + component.description} arrow>
          {/* Display Image thumbnail; also the drag source registered by AddComponent */}
          <img
            ref={imageRef}
            className='compImage'
            src={'../' + (component.svg_path || '')}
            alt={component.name || 'component'}
            aria-describedby={id}
            onClick={handleClick}
            onError={(e) => { e.target.style.visibility = 'hidden' }}  // R7: hide broken images
          />
        </Tooltip>

        {/* Star icon overlay — only shown when user is logged in */}
        {localStorage.getItem('esim_token') && (
          <Tooltip title={isStarred() ? 'Remove from favourites' : 'Add to favourites'} arrow>
            <IconButton
              className={classes.starBtn}
              size="small"
              onClick={handleStarToggle}
              disabled={favLoading}     // Fix #3: disabled while API call is in flight
              aria-label={             // Fix #10: human-readable label
                isStarred()
                  ? `Remove ${component.name} from favourites`
                  : `Add ${component.name} to favourites`
              }
            >
              {isStarred()
                ? <StarIcon className={classes.starIconOn} />
                : <StarBorderIcon className={classes.starIconOff} />}
            </IconButton>
          </Tooltip>
        )}
      </div>

      {/* Popover — shows component details on thumbnail click */}
      <Popover
        id={id}
        open={open}
        className={classes.popup}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <List component="div" className={classes.popupInfo} disablePadding dense>
          <ListItemText>
            <b>Component Name:</b> {component.name}
          </ListItemText>

          {component.description !== '' &&
            <ListItemText>
              <b>Description:</b> {component.description}
            </ListItemText>
          }

          {component.keyword !== '' &&
            <ListItemText>
              <b>Keywords:</b> {component.keyword}
            </ListItemText>
          }

          {component.data_link !== '' &&
            <ListItemText>
              <b>Datasheet:</b>{' '}
              <a href={component.data_link} rel="noopener noreferrer" target="_blank">
                {component.data_link}
              </a>
            </ListItemText>
          }

          {/* Show 'Add to Favourites' only when not already starred */}
          {!isStarred() && localStorage.getItem('esim_token') &&
            <ListItemText>
              <Button
                onClick={() => handleFavourite(component.id)}
                disabled={favLoading}    // Fix #3: disable during in-flight request
              >
                Add to Favourites
              </Button>
            </ListItemText>
          }

          {/* Show 'Remove from Favourites' when already starred */}
          {isStarred() && localStorage.getItem('esim_token') &&
            <ListItemText>
              <Button
                onClick={() => handleRemove(component.id)}
                disabled={favLoading}    // Fix #3: disable during in-flight request
              >
                Remove from Favourites
              </Button>
            </ListItemText>
          }
        </List>
      </Popover>

      <Snackbar
        style={{ zIndex: 100 }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={snackbar.open}             // Fix #13: unified snackbar state
        autoHideDuration={2000}
        onClose={closeSnackbar}
        message={snackbar.message}
        action={
          <>
            <IconButton size="small" aria-label="close" color="inherit" onClick={closeSnackbar}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
      />
    </div>
  )
}

// Fix #7: removed dead isFavourite prop from PropTypes
SideComp.propTypes = {
  component: PropTypes.object.isRequired,
  setFavourite: PropTypes.func,
  favourite: PropTypes.array
}
