import React, { useEffect } from 'react'
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
  input: {
    marginLeft: theme.spacing(1),
    width: '200px',
    color: '#595959'
  },
  rightBlock: {
    marginLeft: 'auto',
    marginRight: theme.spacing(2)
  },
  button: {
    marginRight: theme.spacing(0.7)
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

// Notification snackbar to give alert messages
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

  // handel notification snackbar open and close with message
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

  // handel schematic Share Dialog box
  const [openShare, setShareOpen] = React.useState(false)

  const handleShareOpen = () => {
    setShareOpen(true)
  }

  const handleShareClose = () => {
    setShareOpen(false)
  }

  // change saved schematic share status
  const [shared, setShared] = React.useState(schSave.isShared)

  useEffect(() => {
    setShared(schSave.isShared)
  }, [schSave.isShared])

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

  // handel display format of last saved status
  function getDate (jsonDate) {
    var json = jsonDate
    var date = new Date(json)
    const dateTimeFormat = new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const [{ value: month }, , { value: day }, , { value: hour }, , { value: minute }, , { value: second }] = dateTimeFormat.formatToParts(date)
    return `${day} ${month} ${hour}:${minute}:${second}`
  }

  // handel Copy Share Url
  const textAreaRef = React.useRef(null)

  function copyToClipboard (e) {
    textAreaRef.current.select()
    document.execCommand('copy')
    e.target.focus()
    setMessage('Copied Successfully!')
    handleSnacClick()
  }

  return (
    <Toolbar variant="dense" color="default">
      <SimpleSnackbar open={snacOpen} close={handleSnacClose} message={message} />

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
        <Link color="inherit" target='_blank' component={RouterLink} to="/">
          eSim
        </Link>
      </Typography>

      {/* Input field for schematic title */}
      <Hidden xsDown>
        <Input
          className={classes.input}
          color="secondary"
          value={schSave.title === 'Untitled_Schematic' ? 'Untitled_Schematic' : schSave.title}
          onChange={titleHandler}
          inputProps={{ 'aria-label': 'SchematicTitle' }}
        />
      </Hidden>

      {/* Display last saved and shared option for saved schematics */}
      {auth.isAuthenticated === true
        ? <>
          {(schSave.isSaved === true && schSave.details.save_time !== undefined)
            ? <Typography
              variant="body2"
              style={{ margin: '0px 15px 0px auto', paddingTop: '5px', color: '#8c8c8c' }}
            >
              Last Saved : {getDate(schSave.details.save_time)} {/* Display last saved status for saved schematics */}
            </Typography>
            : <></>
          }
          <Button
            size="small"
            variant={shared !== true ? 'outlined' : 'contained'}
            color="primary"
            className={schSave.isSaved === true && schSave.details.save_time !== undefined ? classes.button : classes.rightBlock}
            startIcon={<ShareIcon />}
            onClick={handleShare}
          >
            <Hidden xsDown>Share</Hidden>
          </Button>
        </>
        : <></>
      }

      {/* Share dialog box to get share url */}
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
              ? <input
                ref={textAreaRef}
                value={`${window.location.protocol}\\\\${window.location.host}/eda/#/editor?id=${schSave.details.save_id}`}
                readOnly
              />
              : <> Turn On sharing </>
            }
          </DialogContentText>

        </DialogContent>
        <DialogActions>
          {shared === true && document.queryCommandSupported('copy')
            ? <Button onClick={copyToClipboard} color="primary" autoFocus>
              Copy url
            </Button>
            : <></>
          }
          <Button onClick={handleShareClose} color="primary" autoFocus>
            close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Display login option or user menu as per authenticated status */}
      {
        (!auth.isAuthenticated ? (<Button
          size="small"
          component={RouterLink}
          to="/login"
          style={{ marginLeft: 'auto' }}
          color="primary"
          variant="outlined"
        >
          Login
        </Button>)
          : (<>

            <IconButton
              edge="start"
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
                store.dispatch(logout(history))
              }}>
                Logout
              </MenuItem>
            </Menu>
          </>
          )
        )
      }
    </Toolbar>
  )
}

export default Header
