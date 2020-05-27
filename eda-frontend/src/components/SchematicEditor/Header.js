import React from 'react'
import {
  Toolbar,
  Typography,
  IconButton,
  Button,
  Input,
  Hidden,
  Link,
  Avatar
} from '@material-ui/core'
import { useDispatch } from 'react-redux'
import ShareIcon from '@material-ui/icons/Share'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'
import logo from '../../static/logo.png'
import setTitle from '../../redux/actions/netlistActions'

const useStyles = makeStyles((theme) => ({
  toolbarTitle: {
    marginRight: theme.spacing(2)
  },
  form: {
    flexGrow: 1
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    color: '#595959'
  },
  rightBlock: {
    marginLeft: 'auto'
  },
  button: {
    marginRight: theme.spacing(1)
  },
  small: {
    width: theme.spacing(3.7),
    height: theme.spacing(3.7)
  }
}))

function Header () {
  const dispatch = useDispatch()
  const classes = useStyles()
  const titleHandler = (e) => {
    dispatch(setTitle(`* ${e.target.value}`))
  }
  return (
    <Toolbar variant="dense" color="default">
      <IconButton edge="start" className={classes.button} color="primary">
        <Avatar alt="esim logo" src={logo} className={classes.small} />
      </IconButton>
      <Typography
        variant="h6"
        color="inherit"
        noWrap
        className={classes.toolbarTitle}
      >
        <Link color="inherit" component={RouterLink} to="/">
        eSim
        </Link>
      </Typography>

      <Hidden xsDown>
        <form className={classes.form} noValidate autoComplete="off">
          <Input
            className={classes.input}
            defaultValue="Untitled_Schematic"
            color="secondary"
            onChange={titleHandler}
            inputProps={{ 'aria-label': 'SchematicTitle' }}
          />
        </form>
      </Hidden>

      <div className={classes.rightBlock}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          className={classes.button}
          startIcon={<ShareIcon />}
        >
          <Hidden xsDown>Share</Hidden>
        </Button>

        <Button
          size="small"
          component={RouterLink}
          to="/login"
          color="primary"
          variant="outlined"
          className={classes.button}
        >
          Login
        </Button>
      </div>
    </Toolbar>
  )
}

export default Header
