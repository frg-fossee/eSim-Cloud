import React from 'react'

import { AppBar, Button, Toolbar, Typography, Link, IconButton, Avatar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'
import logo from '../../static/logo.png'

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
  }
}))

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
        <nav>

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
            to="/simulator"
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
        </nav>
        <Button
          size="small"
          to="/login"
          component={RouterLink}
          color="primary"
          variant="outlined"
          className={classes.link}
        >
          Login
        </Button>
      </Toolbar>
    </AppBar>
  )
}
