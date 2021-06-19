import React from 'react'

import {
  AppBar, Button, Toolbar, Typography, Link, IconButton, Avatar, Menu, ListItemText,
  Fade,
  MenuItem
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { deepPurple } from '@material-ui/core/colors'
import { Link as RouterLink, useHistory } from 'react-router-dom'
import logo from '../../static/logo.png'
import store from '../../redux/store'
import { logout } from '../../redux/actions/index'

const useStyles = makeStyles((theme) => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  toolbar: {
    flexWrap: 'wrap'
  },
  toolbarTitle: {
    flexGrow: 1
  },
  link: {
    margin: theme.spacing(1, 1.5)
  },
  button: {
    marginRight: theme.spacing(0.7)
  },
  small: {
    width: theme.spacing(3.7),
    height: theme.spacing(3.7)
  },
  purple: {
    width: theme.spacing(3.75),
    height: theme.spacing(3.75),
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
    fontSize: '17px'
  }
}))

// Common navbar for Dashboard, Home, Simulator, Gallery, etc.
export function Header () {
  const history = useHistory()
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const auth = store.getState().authReducer

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      {/* Display logo */}
      <IconButton edge="start" className={classes.button} color="primary">
        <Avatar alt="esim logo" src={logo} className={classes.small} />
      </IconButton>
      <Typography
        variant="h6"
        color="inherit"
        noWrap
        className={classes.toolbarTitle}
      >
        <Link color="inherit" to="/" component={RouterLink}>
          eSim
        </Link>
      </Typography>

      {/* Display relative link to other pages */}
      <nav>
        {
          (auth.isAuthenticated
            ? (<>
              <Link
                variant="button"
                color="textPrimary"
                to="/"
                component={RouterLink}
                className={classes.link}
              >
                Home
              </Link>

              <Link
                variant="button"
                color="textPrimary"
                to="/editor"
                component={RouterLink}
                className={classes.link}
              >
                Editor
              </Link>

              <Link
                variant="button"
                color="textPrimary"
                to="/gallery"
                component={RouterLink}
                className={classes.link}
              >
                Gallery
              </Link>

              <Link
                variant="button"
                color="textPrimary"
                to="/simulator/ngspice"
                component={RouterLink}
                className={classes.link}
              >
                Simulator
              </Link>

              <Link
                variant="button"
                color="textPrimary"
                to="/dashboard"
                component={RouterLink}
                className={classes.link}
              >
                Dashboard
              </Link>
            </>)
            : (<>
              <Link
                variant="button"
                color="textPrimary"
                to="/editor"
                component={RouterLink}
                style={{ marginRight: '20px' }}
              >
                Editor
              </Link>

              <Link
                variant="button"
                color="textPrimary"
                to="/gallery"
                component={RouterLink}
                style={{ marginRight: '20px' }}
              >
                Gallery
              </Link>

              <Link
                variant="button"
                color="textPrimary"
                to="/simulator/ngspice"
                component={RouterLink}
                style={{ marginRight: '20px' }}
              >
                Simulator
              </Link>
            </>
            )
          )
        }
      </nav>

      {/* Display login option or user menu as per authenticated status */}
      {
        (!auth.isAuthenticated ? (<Button
          size="small"
          component={RouterLink}
          to="/login"
          color="primary"
          variant="outlined"
        >
          Login
        </Button>)
          : (<>

            <IconButton
              edge="start"
              style={{ marginLeft: 'auto' }}
              color="primary"
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleClick}
            >
              <Avatar className={classes.purple}>
                {auth.user.username.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
              TransitionComponent={Fade}
              style={{ marginTop: '25px' }}
            >
              <MenuItem
                component={RouterLink}
                to="/dashboard"
                onClick={handleClose}
              >
                <ListItemText primary={auth.user.username} secondary={auth.user.email} />
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/dashboard/profile"
                onClick={handleClose}
              >
                My Profile
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/dashboard/schematics"
                onClick={handleClose}
              >
                My Schematics
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/account/change_password"
                onClick={handleClose}
              >
                Change password
              </MenuItem>
              <MenuItem onClick={() => {
                store.dispatch(logout(history))
              }}>
                Logout
              </MenuItem>
            </Menu>
          </>
          )
        )
      }
    </>
  )
}

export default function Navbar () {
  const classes = useStyles()

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      className={classes.appBar}
    >
      <Toolbar variant="dense" color="default" className={classes.toolbar}>

        <Header />
      </Toolbar>
    </AppBar>
  )
}
