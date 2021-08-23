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
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import * as actions from '../../redux/actions/actions'
import logo from '../../static/logo.png'
import { setTitle, logout, setSchTitle, setSchShared, loadMinUser, setSchDescription } from '../../redux/actions/index'
import queryString from 'query-string'

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
  },
  backDrop: {
    backdropFilter: 'blur(10px)'
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

function Header (props) {
  const history = useHistory()
  const classes = useStyles()
  const auth = useSelector(state => state.authReducer)
  const schSave = useSelector(state => state.saveSchematicReducer)
  const [anchorEl, setAnchorEl] = React.useState(null)

  const [loginDialog, setLoginDialog] = React.useState(false)
  const [logoutConfirm, setLogoutConfirm] = React.useState(false)
  const [reloginMessage, setReloginMessage] = React.useState('')
  const [ltiId, setLtiId] = React.useState(null)
  const [ltiNonce, setLtiNonce] = React.useState(null)

  var homeURL = `${window.location.protocol}\\\\${window.location.host}/`
  const dispatch = useDispatch()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  // Checks for localStore changess
  useEffect(() => {
    function checkUserData () {
      const userToken = localStorage.getItem('esim_token')
      if (userToken && userToken !== '') {
        // esim_token was added by another tab
        const newUser = parseInt(localStorage.getItem('user_id'))
        if (auth.isAuthenticated === null) {
          dispatch(loadMinUser())
        } else if (auth.user && auth.user.id === newUser) {
          dispatch(loadMinUser())
          setLoginDialog(false)
        } else {
          setReloginMessage('You are logged in but the circuit belongs to a different user! Login again with the same credentials')
        }
      } else {
        /* User logged out and esim_token removed from localstore
        But redux store still has it */
        if (auth.token && auth.token !== '') {
          if (!loginDialog) {
            setReloginMessage('You have been logged out of your account. Login again')
            setLoginDialog(true)
          }
        }
      }
    }

    window.addEventListener('storage', checkUserData)

    return () => {
      window.removeEventListener('storage', checkUserData)
    }
  })

  useEffect(() => {
    var url = queryString.parse(window.location.href.split('editor')[1])
    if (url.lti_id) {
      setLtiId(url.lti_id)
    }
    if (url.lti_nonce) {
      setLtiNonce(url.lti_nonce)
    }
  }, [])

  const handleClose = () => {
    setAnchorEl(null)
  }

  const titleHandler = (e) => {
    dispatch(setTitle(`* ${e.target.value}`))
    dispatch(setSchTitle(`${e.target.value}`))
  }

  // handle notification snackbar open and close with message
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

  // handle schematic Share Dialog box
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

  useEffect(() => {
    if (history.location.search === '') {
      dispatch(setSchTitle('Untitled_Schematic'))
      dispatch(setSchDescription(''))
      dispatch({ type: actions.CLEAR_DETAILS })
    }
  }, [history.location.search, dispatch])

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

  // handle display format of last saved status
  function getDate (jsonDate) {
    const json = jsonDate
    const date = new Date(json)
    const dateTimeFormat = new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const [{ value: month }, , { value: day }, , { value: hour }, , { value: minute }, , { value: second }] = dateTimeFormat.formatToParts(date)
    return `${day} ${month} ${hour}:${minute}:${second}`
  }

  // handle Copy Share Url
  const textAreaRef = React.useRef(null)

  function copyToClipboard (e) {
    textAreaRef.current.select()
    document.execCommand('copy')
    e.target.focus()
    setMessage('Copied Successfully!')
    handleSnacClick()
  }

  return (
    <>
      <Dialog
        open={loginDialog}
        BackdropProps={{
          classes: {
            root: classes.backDrop
          }
        }}
        maxWidth='xs'
        disableEscapeKeyDown
        disableBackdropClick
      >
        <DialogTitle id="alert-dialog-title" style={{ textAlign: 'center' }}>
          <ErrorOutlineIcon style={{ color: 'red' }} fontSize="large" /><br />
          <Typography variant='h5' align='center'>
            {'Login to continue working on the circuit'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Typography variant='p'>
              {reloginMessage}
              {' to continue working on the circuit, otherwise all unsaved changes will be lost.'}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => { window.location.reload() }}
            color="secondary"
          >
            Start New Circuit
          </Button>
          <Button
            component={RouterLink}
            to="/login?close=close&logout=logout"
            color="primary"
            target="_blank"
          >
            Login
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={logoutConfirm}
        onClose={() => { setLogoutConfirm(false) }}
      >
        <DialogTitle id="alert-dialog-title" style={{ textAlign: 'center' }}>
          <ErrorOutlineIcon style={{ color: 'red' }} fontSize="large" /><br />
          <Typography variant='h5' align='center'>
            {'Are you sure you want to logout?'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You will lose all unsaved changes if you logout now.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setLogoutConfirm(false) }} color="secondary">
            Cancel
          </Button>
          <Button
            style={{ color: '#ff1744' }}
            onClick={() => {
              dispatch(logout(history))
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

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
        {(!ltiId || !ltiNonce) &&
          (!auth.isAuthenticated
            ? <>
              <Link
                variant="button"
                color="textPrimary"
                onClick={() => { window.open(homeURL, '_self') }}
                component={RouterLink}
                className={classes.link}
                style={{ marginLeft: '61%', marginRight: '20px' }}
              >
                Home
              </Link>
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
              <Button
                size="small"
                component={RouterLink}
                to="/login?close=close"
                style={{ marginLeft: 'auto' }}
                color="primary"
                variant="outlined"
                target="_blank"
              >
              Login
              </Button>
            </>
            : (<>

              <Link
                variant="button"
                color="textPrimary"
                onClick={() => { window.open(homeURL, '_self') }}
                component={RouterLink}
                className={classes.link}
                style={{ marginRight: '20px' }}
              >
                Home
              </Link>
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
              <Link
                variant="button"
                color="textPrimary"
                to="/dashboard"
                component={RouterLink}
                style={{ marginRight: '20px' }}
              >
                Dashboard
              </Link>

              <IconButton
                edge="start"
                color="primary"
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleClick}
                style={{ marginRight: '20px' }}
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
                <MenuItem
                  target='_blank'
                  component={RouterLink}
                  to="/account/change_password"
                  onClick={handleClose}
                >
                  Change password
                </MenuItem>
                <MenuItem onClick={() => {
                  setLogoutConfirm(true)
                }}>
                  Logout
                </MenuItem>
              </Menu>
            </>
            )
          )
        }
        {ltiId && ltiNonce && <Typography
          variant="h6"
          color="inherit"
          noWrap
          className={classes.toolbarTitle}
          style={{ marginLeft: 'auto', color: 'red' }}
        >
          Exam
        </Typography>}
      </Toolbar>
    </>
  )
}

export default Header
