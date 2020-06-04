import React from 'react'
import {
  Toolbar,
  Typography,
  IconButton,
  Button,
  Input,
  Hidden,
  Link,
  Avatar,
  Menu,
  Fade,
  MenuItem,
  ListItemText
} from '@material-ui/core'
import { useDispatch } from 'react-redux'
import ShareIcon from '@material-ui/icons/Share'
import { makeStyles } from '@material-ui/core/styles'
import { deepPurple } from '@material-ui/core/colors'
import { Link as RouterLink } from 'react-router-dom'
import logo from '../../static/logo.png'
import { setTitle, logout, setSchTitle } from '../../redux/actions/index'
import store from '../../redux/store'

const useStyles = makeStyles((theme) => ({
  toolbarTitle: {
    marginRight: theme.spacing(2)
  },
  form: {
    flexGrow: 1
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    color: '#595959'
  },
  rightBlock: {
    marginLeft: 'auto'
  },
  button: {
    marginRight: theme.spacing(1)
  },
  small: {
    width: theme.spacing(3.7),
    height: theme.spacing(3.7)
  },
  tools: {
    padding: theme.spacing(1),
    margin: theme.spacing(0, 0.8),
    color: '#262626'
  },
  purple: {
    width: theme.spacing(3.75),
    height: theme.spacing(3.75),
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
    fontSize: '17px'
  }
}))

function Header () {
  const classes = useStyles()
  const auth = store.getState().authReducer
  const [anchorEl, setAnchorEl] = React.useState(null)

  const dispatch = useDispatch()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const titleHandler = (e) => {
    dispatch(setTitle(`* ${e.target.value}`))
    dispatch(setSchTitle(`${e.target.value}`))
  }

  return (
    <Toolbar variant="dense" color="default">
      <IconButton edge="start" className={classes.button} color="primary">
        <Avatar alt="esim logo" src={logo} className={classes.small} />
      </IconButton>
      <Typography
        variant="h6"
        color="inherit"
        noWrap
        className={classes.toolbarTitle}
      >
        <Link color="inherit" target='blank' component={RouterLink} to="/">
          eSim
        </Link>
      </Typography>

      <Hidden xsDown>
        <form className={classes.form} noValidate autoComplete="off">
          <Input
            className={classes.input}
            defaultValue="Untitled_Schematic"
            color="secondary"
            onChange={titleHandler}
            inputProps={{ 'aria-label': 'SchematicTitle' }}
          />
        </form>
      </Hidden>

      <div className={classes.rightBlock}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          className={classes.button}
          startIcon={<ShareIcon />}
        >
          <Hidden xsDown>Share</Hidden>
        </Button>

        {
          (!auth.isAuthenticated ? (<Button
            size="small"
            component={RouterLink}
            to="/login"
            color="primary"
            variant="outlined"
            className={classes.button}
          >
            Login
          </Button>)
            : (<>

              <IconButton
                edge="start"
                className={classes.button}
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
                  target='blank'
                  component={RouterLink}
                  to="/dashboard"
                  onClick={handleClose}
                >
                  <ListItemText primary={auth.user.username} secondary={auth.user.email} />
                </MenuItem>
                <MenuItem
                  target='blank'
                  component={RouterLink}
                  to="/dashboard/profile"
                  onClick={handleClose}
                >
                  My Profile
                </MenuItem>
                <MenuItem
                  target='blank'
                  component={RouterLink}
                  to="/dashboard/schematics"
                  onClick={handleClose}
                >
                  My Schematics
                </MenuItem>
                <MenuItem onClick={() => {
                  store.dispatch(logout())
                }}>
                  Logout
                </MenuItem>
              </Menu>
            </>
            )
          )
        }
      </div>
    </Toolbar>
  )
}

export default Header
