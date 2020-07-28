// Main layout for home page.
import React, { useEffect } from 'react'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import { Link as RouterLink } from 'react-router-dom'
import logo from '../static/logo.png'

const useStyles = makeStyles((theme) => ({
  header: {
    padding: theme.spacing(23, 0, 6)
  }
}))

export default function Home () {
  const classes = useStyles()

  useEffect(() => {
    document.title = 'eSim'
  })

  return (
    <Container maxWidth="sm" component="main" className={classes.header}>
      <center>
        <img src={logo} width='120' height='120' alt='Logo' />
      </center>
      <Typography
        component="h1"
        variant="h2"
        align="center"
        color="textPrimary"
        gutterBottom
      >
        eSim on Cloud
      </Typography>
      <Typography
        variant="h5"
        align="center"
        color="textSecondary"
        component="p"
      >
        Online Circuit Simulator
        <br></br>
        <br></br>
        <Button
          component={RouterLink}
          to="/editor"
          variant="contained"
          size="large"
          color="primary"
        >
          Schematic Editor
        </Button>
      </Typography>
    </Container>
  )
}
