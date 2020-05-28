import React, { useEffect, useState } from 'react'
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
import { Link as RouterLink } from 'react-router-dom'
import axios from "axios"
const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(27),
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

    const [userCredentials,setUserCredentials] = useState({email:"",username:"",password:"",password2:""})
    const [error,setError] = useState({eemail:false,eusername:false,epassword:false,epassword2:false})

const changeHandler = (e) => {
    setUserCredentials({...userCredentials,[e.target.name]: e.target.value })
}

const submitHandler = (e) => {
    e.preventDefault()
    console.log(userCredentials)
    console.log("HELLO")

}


const validate = () => {
    let isError = false;
    let errors = {}

    if (userCredentials.username.length < 5){
        isError = true;
        errors["eusername"] = true
    }else{
        errors["eusername"] = false
    }

    if(isError){
        setError(Object.assign(error,errors))
    }
    console.log(error)

    return isError
}

const submit = () => {
    console.log(userCredentials)


    const err = validate();

    if(!err){
        const cred = userCredentials
        delete cred.password2

        axios.post('http://localhost/api/auth/users/', cred)
        .then(response => {
            console.log(response)
        })
        .catch(error => {
            console.log(error)
        })
    }else{
        console.log("error")
    }

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

        <form className={classes.form} onSubmit={submitHandler}>
        <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            error = {error.eemail}
            helperText={error.eemail ? "invalid email": ""}
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
            helperText={error.eusername ? "invalid username": ""}
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
            error={error.epassword2}
            value={userCredentials.password2}
            onChange={changeHandler}
            autoComplete="current-password"
          />
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="I accept the Terms of Use & Privacy Policy"
          /> */}
          <Button
            component={RouterLink}
            // to="/dashboard"
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            // onClick={submit}
            className={classes.submit}
          >
            Login
          </Button>

        </form>
      </Card>
      {/* <Button
        component={RouterLink}
        to="/"
        type="Sign Up"
        fullWidth
        color="default"
        className={classes.submit}
      >
        Back to home
      </Button> */}
    </Container>
  )
}
