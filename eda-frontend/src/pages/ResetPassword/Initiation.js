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
import { resetPassword, authDefault } from '../../redux/actions/index'

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

export default function ResetPassword () {
  const classes = useStyles()

  const auth = useSelector(state => state.authReducer)

  const dispatch = useDispatch()
  var homeURL = `${window.location.protocol}\\\\${window.location.host}/`

  useEffect(() => {
    dispatch(authDefault())
    document.title = 'Reset password - eSim '
  }, [dispatch])

  const [email, setEmail] = useState('')

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
            id="email"
            label="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => dispatch(resetPassword(email))}
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
