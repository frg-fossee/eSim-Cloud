import React, { useState, useEffect } from 'react'
import {
  Container,
  Button,
  Typography,
  TextField,
  Card,
  Avatar,
  InputAdornment,
  IconButton
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import { useSelector, useDispatch } from 'react-redux'
import { changePassword } from '../../redux/actions/index'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(20),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3, 5)
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(1.5, 0)
  }
}))

export default function ChangePassword () {
  const classes = useStyles()

  const account = useSelector(state => state.accountReducer)

  const dispatch = useDispatch()
  var homeURL = `${window.location.protocol}\\\\${window.location.host}/`

  const history = useHistory()

  useEffect(() => {
    document.title = 'Change password - eSim '
  }, [dispatch])

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [reNewPassword, setReNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showReNewPassword, setShowReNewPassword] = useState(false)

  const handleClickShowNewPassword = () => setShowNewPassword(!showNewPassword)
  const handleMouseDownNewPassword = () => setShowNewPassword(!showNewPassword)

  const handleClickShowReNewPassword = () => setShowReNewPassword(!showReNewPassword)
  const handleMouseDownReNewPassword = () => setShowReNewPassword(!showReNewPassword)

  const handleClickShowCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword)
  const handleMouseDownCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword)

  return (
    <Container component="main" maxWidth="xs">
      <Card className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Change password
        </Typography>

        {/* Display's error messages while signing in */}
        <Typography variant="body1" align="center" style={{ marginTop: '10px' }} color={account.changePasswordSuccess ? 'secondary' : 'error'}>
          {account.changePasswordError}
        </Typography>

        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="currentPassword"
            label="Current password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="toggle password visibility"
                    onClick={handleClickShowCurrentPassword}
                    onMouseDown={handleMouseDownCurrentPassword}
                  >
                    {showCurrentPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />} {/* Handle password visibility */}
                  </IconButton>
                </InputAdornment>
              )
            }}
            type={showCurrentPassword ? 'text' : 'password'}
            id="currentPassword"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="toggle password visibility"
                    onClick={handleClickShowNewPassword}
                    onMouseDown={handleMouseDownNewPassword}
                  >
                    {showNewPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />} {/* Handle password visibility */}
                  </IconButton>
                </InputAdornment>
              )
            }}
            type={showNewPassword ? 'text' : 'password'}
            id="newPassword"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="reNewPassword"
            label="Re-enter password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="toggle password visibility"
                    onClick={handleClickShowReNewPassword}
                    onMouseDown={handleMouseDownReNewPassword}
                  >
                    {showReNewPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />} {/* Handle password visibility */}
                  </IconButton>
                </InputAdornment>
              )
            }}
            type={showReNewPassword ? 'text' : 'password'}
            id="reNewPassword"
            value={reNewPassword}
            onChange={e => setReNewPassword(e.target.value)}
            autoComplete="re-new-password"
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => dispatch(changePassword(currentPassword, newPassword, reNewPassword, history))}
            className={classes.submit}
            disabled={false}
          >
            Reset password
          </Button>
        </form>

      </Card>
      <Button
        fullWidth
        onClick={() => { window.open(homeURL, '_self') }}
        color="default"
        className={classes.submit}
      >
        Back to home
      </Button>
    </Container>
  )
}
