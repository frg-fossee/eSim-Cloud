import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { List, ListItemText, Tooltip, Popover } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import api from '../../utils/Api'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'


import './Helper/SchematicEditor.css'
import { AddComponent } from './Helper/SideBar.js'

const useStyles = makeStyles((theme) => ({
  popupInfo: {
    margin: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    border: '1px solid blue',
    borderRadius: '5px'
  }
}))

export default function SideComp({ isFavourite = false, favourite, setFavourite, component }) {
  const classes = useStyles()
  const imageRef = React.createRef()

  const [openSnackbar, setOpenSnackbar] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpenSnackbar(false)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  useEffect(() => {
    // Function call to make components draggable
    AddComponent(component, imageRef.current)
  }, [imageRef, component])

  const addFavourite = (id) => {
    const token = localStorage.getItem('esim_token')
    const body = {
      component: [id]
    }
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    api.post('favouritecomponents', body, config).then(resp => {
      setFavourite(resp.data.component)
    }).catch(err => {
      console.log(err)
    })
    setAnchorEl(null)
  }

  const handleFavourite = (id) => {
    if (favourite) {
      var flag = 0
      for (var i = 0; i < favourite.length; i++) {
        if (favourite[i].id === id) {
          flag = 1
          break
        }
      }
      if (!flag) {
        addFavourite(id)
      } else {
        setOpenSnackbar(true)
      }
    } else {
      addFavourite(id)
    }
  }

  const handleRemove = (id) => {
    const token = localStorage.getItem('esim_token')
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    api.delete(`favouritecomponents/${id}`, config).then(resp => {
      setFavourite(resp.data.component)
    }).catch(err => {
      console.log(err)
    })
    setAnchorEl(null)
  }
  return (
    <div>
      <Tooltip title={component.full_name + ' : ' + component.description} arrow>
        {/* Display Image thumbnail in left side pane */}
        <img ref={imageRef} className='compImage' src={'../' + component.svg_path} alt="Logo" aria-describedby={id} onClick={handleClick} />
      </Tooltip>

      {/* Popover to display component information on single click */}
      <Popover
        id={id}
        open={open}
        className={classes.popup}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <List component="div" className={classes.popupInfo} disablePadding dense >
          <ListItemText>
            <b>Component Name:</b> {component.name}
          </ListItemText>

          {component.description !== '' &&
            <ListItemText>
              <b>Description:</b> {component.description}
            </ListItemText>
          }
          {
            component.keyword !== '' &&
            <ListItemText>
              <b>Keywords:</b> {component.keyword}
            </ListItemText>

          }

          {
            component.data_link !== '' &&
            <ListItemText>
              <b>Datasheet:</b> <a href={component.data_link} rel="noopener noreferrer" target='_blank' >{component.data_link}</a>
            </ListItemText>
          }

          {!isFavourite && localStorage.getItem('esim_token') &&
            <ListItemText>
              <Button onClick={() => handleFavourite(component.id)}>Add to Favourites</Button>
            </ListItemText>
          }

          {isFavourite && localStorage.getItem('esim_token') &&
            <ListItemText>
              <Button onClick={() => handleRemove(component.id)}>Remove from Favourites</Button>
            </ListItemText>
          }
        </List>
      </Popover>
      <Snackbar
        style={{zIndex:100}}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message="This component is already added to favourites"
        action={
          <>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
      />
    </div>
  )
}

SideComp.propTypes = {
  component: PropTypes.object.isRequired,
  isFavourite: PropTypes.bool,
  setFavourite: PropTypes.func,
  favourite: PropTypes.array
}
