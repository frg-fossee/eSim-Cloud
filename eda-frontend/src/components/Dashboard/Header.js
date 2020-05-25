import React from 'react'
import {
  Typography,
  Link,
  IconButton,
  Hidden,
  Menu,
  MenuItem,
  Fade
} from '@material-ui/core'
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
  toolbarTitle: {
    marginRight: theme.spacing(3)
  },
  link: {
    margin: theme.spacing(1, 1.5)
  }
}))

export default function Header () {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Typography
        variant="h6"
        color="inherit"
        noWrap
        className={classes.toolbarTitle}
      >
        <Link color="inherit" component={RouterLink} to="/">
          EDA Cloud
        </Link>
      </Typography>
      <Hidden smDown>
        <nav>
          <Link
            variant="button"
            color="textPrimary"
            component={RouterLink}
            to="/"
            className={classes.link}
          >
            Home
          </Link>
          <Link
            variant="button"
            color="textPrimary"
            component={RouterLink}
            to="/editor"
            className={classes.link}
          >
            Editor
          </Link>
          <Link
            variant="button"
            color="textPrimary"
            component={RouterLink}
            to="/simulator"
            className={classes.link}
          >
            Simulator
          </Link>
          <Link
            variant="button"
            color="textPrimary"
            component={RouterLink}
            to="/dashboard"
            className={classes.link}
          >
            Dashboard
          </Link>
        </nav>
      </Hidden>
      <IconButton
        edge="start"
        className={classes.button}
        style={{ marginLeft: 'auto' }}
        color="primary"
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <AccountCircleRoundedIcon />
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
        <MenuItem onClick={handleClose}>Settings</MenuItem>
        <MenuItem component={RouterLink} to="/login" onClick={handleClose}>
          Logout
        </MenuItem>
      </Menu>
    </>
  )
}
