import React, { useEffect, useState } from 'react'
import {
  Container,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  Card,
  Avatar
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import { Link as RouterLink } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(10),
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
  },
  checkboxText: {
    color: 'red',
    marginLeft: theme.spacing(5)
  }
}))

export default function SignUp () {
  const classes = useStyles()

  const [userCredentials, setUserCredentials] = useState({ email: '', username: '', password: '', password2: '' })
  const [error, setError] = useState({ eemail: false, eusername: false, epassword: false, epassword2: false, checkbox: false })
  const [checkbox, setCheckbox] = useState(false)
  const changeHandler = (e) => {
    setUserCredentials({ ...userCredentials, [e.target.name]: e.target.value })
  }

  const validate = () => {
    let isError = false
    const errors = {}

    if (!checkbox) {
      isError = true
      errors.checkbox = true
    } else {
      errors.checkbox = false
    }

    if (!userCredentials.email.match(/.+@.+/) || userCredentials.email === '') {
      isError = true
      errors.eemail = true
    } else {
      errors.eemail = false
    }

    if (userCredentials.username.length < 5 || userCredentials.username === '') {
      isError = true
      errors.eusername = true
    } else {
      errors.eusername = false
    }

    if (userCredentials.password !== userCredentials.password2 || userCredentials.password === '' || userCredentials.password === '') {
      isError = true
      errors.epassword = true
    } else {
      errors.epassword = false
    }

    setError(Object.assign(error, errors))

    return isError
  }

  useEffect(() => {
    document.title = 'Sign Up - EDA '
  })

  return (
    <Container component="main" maxWidth="xs">
      <Card className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Register | Sign Up
        </Typography>

        <form className={classes.form}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            error = {error.eemail}
            helperText={error.eemail ? 'invalid email' : ''}
            autoFocus
            value={userCredentials.email}
            onChange={changeHandler}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            error={error.eusername}
            helperText={error.eusername ? 'invalid username' : ''}
            autoComplete="Username"
            value={userCredentials.username}
            onChange={changeHandler}
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
            error={error.epassword}
            helperText={error.epassword ? "password did'nt match" : ''}
            value={userCredentials.password}
            onChange={changeHandler}
            autoComplete="current-password"
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password2"
            label="Confirm password"
            type="password"
            id="Confirm_password"
            error={error.epassword}
            helperText={error.epassword ? "password did'nt match" : ''}
            value={userCredentials.password2}
            onChange={changeHandler}
            autoComplete="current-password"
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" checked={checkbox} onChange={() => setCheckbox(!checkbox)} />}
            label="I accept the Terms of Use & Privacy Policy"
          />
          {error.checkbox && <div className={classes.checkboxText}>please read the terms and conditions</div>}
          <Button
            component={RouterLink}
            // to="/dashboard"
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            onClick={validate}
            className={classes.submit}
          >
            Sign Up
          </Button>
        </form>

      </Card>
      <Button
        component={RouterLink}
        to="/"
        type="Sign Up"
        fullWidth
        color="default"
        className={classes.submit}
      >
        Back to home
      </Button>
    </Container>
  )
}
