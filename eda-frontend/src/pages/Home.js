// Main layout for home page.
import React from 'react'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import { Link as RouterLink } from 'react-router-dom'
// import logo from '../static/logo.png'
import { useSelector } from 'react-redux'

const useStyles = makeStyles((theme) => ({
  header: {
    padding: theme.spacing(23, 0, 6)
  }
}))

const DomainInfo = (props) => {
  const domains = useSelector(state => state.DomainActionsReducer.domains)
  const current = useSelector(state => state.DomainActionsReducer.activeDomain)
  var info

  domains.forEach(d => {
    if (current === d.name) {
      if (props.value === 'title') {
        info = d.title
      }
      if (props.value === 'message') {
        info = d.message
      }
      if (props.value === 'logo') {
        info = <img src={'../' + d.logo_path} width='120' height='120' alt='Logo' />
      }
    }
  });
  return <div>{info}</div>
}

export default function Home () {
  const classes = useStyles()
  // const dispatch = useDispatch()

  // useEffect(() => {
  //   dispatch(fetchDomains())
  // }, [dispatch])

  return (
    <Container maxWidth="sm" component="main" className={classes.header}>
      <center>
        <DomainInfo value='logo' />
      </center>
      <Typography
        component="h1"
        variant="h2"
        align="center"
        color="textPrimary"
        gutterBottom
      >
        <DomainInfo value='title' />
      </Typography>
      <Typography
        variant="h5"
        align="center"
        color="textSecondary"
        component="p"
      >
        <DomainInfo value='message' />
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
