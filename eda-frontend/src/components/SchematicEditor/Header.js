import React from 'react'
import PropTypes from 'prop-types'
import { useHistory, Link as RouterLink } from 'react-router-dom'
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
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControlLabel,
  Switch,
  Snackbar
} from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import ShareIcon from '@material-ui/icons/Share'
import CloseIcon from '@material-ui/icons/Close'
import { makeStyles } from '@material-ui/core/styles'
import { deepPurple } from '@material-ui/core/colors'

import logo from '../../static/logo.png'
import { setTitle, logout, setSchTitle, setSchShared } from '../../redux/actions/index'
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

function SimpleSnackbar ({ open, close, message }) {
  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={open}
        autoHideDuration={6000}
        onClose={close}
        message={message}
        action={
          <React.Fragment>
            <IconButton size="small" aria-label="close" color="inherit" onClick={close}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  )
}

SimpleSnackbar.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  message: PropTypes.string
}

function Header () {
  const history = useHistory()
  const classes = useStyles()
  const auth = store.getState().authReducer
  const schSave = useSelector(state => state.saveSchematicReducer)
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

  // Notification Snackbar
  const [snacOpen, setSnacOpen] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const handleSnacClick = () => {
    setSnacOpen(true)
  }

  const handleSnacClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnacOpen(false)
  }

  // Share Dialog box
  const [openShare, setShareOpen] = React.useState(false)

  const handleShareOpen = () => {
    setShareOpen(true)
  }

  const handleShareClose = () => {
    setShareOpen(false)
  }

  const [shared, setShared] = React.useState(schSave.isShared)

  const handleShareChange = (event) => {
    setShared(event.target.checked)
    dispatch(setSchShared(event.target.checked))
  }

  const handleShare = () => {
    if (auth.isAuthenticated !== true) {
      setMessage('You are not Logged In')
      handleSnacClick()
    } else if (schSave.isSaved !== true) {
      setMessage('You have not saved the circuit')
      handleSnacClick()
    } else {
      handleShareOpen()
    }
  }

  return (
    <Toolbar variant="dense" color="default">
      <SimpleSnackbar open={snacOpen} close={handleSnacClose} message={message} />
      <IconButton edge="start" className={classes.button} color="primary">
        <Avatar alt="esim logo" src={logo} className={classes.small} />
      </IconButton>
      <Typography
        variant="h6"
        color="inherit"
        noWrap
        className={classes.toolbarTitle}
      >
        <Link color="inherit" target='_blank' component={RouterLink} to="/">
          eSim
        </Link>
      </Typography>

      <Hidden xsDown>
        <form className={classes.form} noValidate autoComplete="off">
          <Input
            className={classes.input}
            color="secondary"
            value={schSave.title === 'Untitled_Schematic' ? 'Untitled_Schematic' : schSave.title}
            onChange={titleHandler}
            inputProps={{ 'aria-label': 'SchematicTitle' }}
          />
        </form>
      </Hidden>

      <div className={classes.rightBlock}>
        {auth.isAuthenticated === true
          ? <Button
            size="small"
            variant={shared !== true ? 'outlined' : 'contained'}
            color="primary"
            className={classes.button}
            startIcon={<ShareIcon />}
            onClick={handleShare}
          >
            <Hidden xsDown>Share</Hidden>
          </Button>
          : <></>
        }

        <Dialog
          open={openShare}
          onClose={handleShareClose}
          aria-labelledby="share-dialog-title"
          aria-describedby="share-dialog-description"
        >
          <DialogTitle id="share-dialog-title">{'Share Your Schematic'}</DialogTitle>
          <DialogContent>
            <DialogContentText id="share-dialog-description">
              <FormControlLabel
                control={<Switch checked={shared} onChange={handleShareChange} name="shared" />}
                label=": Sharing On"
              />
            </DialogContentText>
            <DialogContentText id="share-dialog-description">
              {shared === true
                ? <>Link : <a href={window.location.href + '/' + schSave.details.save_id}>{window.location.href + '/' + schSave.details.save_id}</a></>
                : <> Turn On sharing </>
              }
            </DialogContentText>

          </DialogContent>
          <DialogActions>
            <Button onClick={handleShareClose} color="primary" autoFocus>
              close
            </Button>
          </DialogActions>
        </Dialog>

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
                  target='_blank'
                  component={RouterLink}
                  to="/dashboard"
                  onClick={handleClose}
                >
                  <ListItemText primary={auth.user.username} secondary={auth.user.email} />
                </MenuItem>
                <MenuItem
                  target='_blank'
                  component={RouterLink}
                  to="/dashboard/profile"
                  onClick={handleClose}
                >
                  My Profile
                </MenuItem>
                <MenuItem
                  target='_blank'
                  component={RouterLink}
                  to="/dashboard/schematics"
                  onClick={handleClose}
                >
                  My Schematics
                </MenuItem>
                <MenuItem onClick={() => {
                  store.dispatch(logout())
                  history.goBack()
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
