// User Sign Up / Register page.
import React, { useState, useEffect } from 'react'
import {
  Container,
  Button,
  Typography,
  TextField,
  Card,
  Avatar,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import { useSelector, useDispatch } from 'react-redux'
import { resetPasswordConfirm, authDefault } from '../../redux/actions/index'

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

export default ResetPasswordConfirm = ({ match }) => {
  const classes = useStyles()

  const auth = useSelector(state => state.authReducer)

  const dispatch = useDispatch()
  var homeURL = `${window.location.protocol}\\\\${window.location.host}/`
  console.log("hey")
  const { id, token } = match.params

  useEffect(() => {
    dispatch(authDefault())
    document.title = 'Reset password - eSim '
  }, [dispatch])

  const [newPassword, setNewPassword] = useState('')
  const [reNewPassword, setReNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showReNewPassword, setShowReNewPassword] = useState(false)

  const handleClickShowNewPassword = () => setShowNewPassword(!showNewPassword)
  const handleMouseDownNewPassword = () => setShowNewPassword(!showNewPassword)

  const handleClickShowReNewPassword = () => setShowReNewPassword(!showReNewPassword)
  const handleMouseDownReNewPassword = () => setShowReNewPassword(!showReNewPassword)


  return (
    <Container component="main" maxWidth="xs">
      <Card className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Reset password
        </Typography>

        {/* Display's error messages while signing in */}
        <Typography variant="body1" align="center" style={{ marginTop: '10px' }} color={auth.resetPasswordError ? 'secondary' : 'error'}>
          {auth.resetPasswordError}
        </Typography>

        <form className={classes.form} noValidate>
        <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="toggle password visibility"
                    onClick={handleClickShowNewPassword}
                    onMouseDown={handleMouseDownNewPassword}
                  >
                    {showNewPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />} {/* Handel password visibility */}
                  </IconButton>
                </InputAdornment>
              )
            }}
            type={showPassword ? 'text' : 'password'}
            id="newPassword"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoComplete="current-password"
          />
            <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="reNewPassword"
            label="reNewPassword"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="toggle password visibility"
                    onClick={handleClickShowReNewPassword}
                    onMouseDown={handleMouseDownReNewPassword}
                  >
                    {showReNewPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />} {/* Handel password visibility */}
                  </IconButton>
                </InputAdornment>
              )
            }}
            type={showReNewPassword ? 'text' : 'password'}
            id="reNewPassword"
            value={reNewPassword}
            onChange={e => setReNewPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => dispatch(resetPasswordConfirm(id, token, newPassword, reNewPassword))}
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
