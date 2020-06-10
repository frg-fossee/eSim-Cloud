import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Button,
  Typography,
  Link,
  Checkbox,
  FormControlLabel,
  TextField,
  Card,
  Avatar
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import { Link as RouterLink, Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { signUp } from '../redux/actions/index'

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
    margin: theme.spacing(3, 0, 2)
  }
}))

export default function SignUp () {
  const classes = useStyles()

  const auth = useSelector(state => state.authReducer)

  useEffect(() => {
    document.title = 'Sign Up - eSim '
  })

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const dispatch = useDispatch()

  if (auth.isRegistered) {
    return <Redirect to="/login" />
  }
  return (
    <Container component="main" maxWidth="xs">
      <Card className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Register | Sign Up
        </Typography>

        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="email"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
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
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="I accept the Terms of Use & Privacy Policy"
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => dispatch(signUp(email, username, password))}
            className={classes.submit}
          >
            Sign Up
          </Button>
          <Grid container>
            <Grid item style={{ marginLeft: 'auto' }} >
              <Link component={RouterLink} to="/login" variant="body2">
                {'Already have account? Login'}
              </Link>
            </Grid>
          </Grid>
        </form>
      </Card>
      <Button
        component={RouterLink}
        to="/"
        fullWidth
        color="default"
        className={classes.submit}
      >
        Back to home
      </Button>
    </Container>
  )
}
