import React from 'react'
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
  TextareaAutosize,
  Popover,
  Tooltip
} from '@material-ui/core'
import { useDispatch } from 'react-redux'
import ShareIcon from '@material-ui/icons/Share'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'
import logo from '../../static/logo.png'
import { setTitle, logout, setSchTitle, setSchDescription } from '../../redux/actions/index'
import store from '../../redux/store'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'

import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded'
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
  },
  tools: {
    padding: theme.spacing(1),
    margin: theme.spacing(0, 0.8),
    color: '#262626'
  }
}))

function Header () {
  const classes = useStyles()
  const auth = store.getState().authReducer
  const schSave = store.getState().saveSchematicReducer
  const [anchorEl, setAnchorEl] = React.useState(null)

  const dispatch = useDispatch()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const titleHandler = (e) => {
    dispatch(setTitle(`* ${e.target.value}`))
    dispatch(setSchTitle(`${e.target.value}`))
  }

  const [anchorEd, setAnchorEd] = React.useState(null)
  const [description, setDescription] = React.useState(schSave.description)

  const handleDiscClick = (event) => {
    setAnchorEd(event.currentTarget)
  }

  const handleDiscClose = () => {
    setAnchorEd(null)
    dispatch(setSchDescription(description))
  }

  const open = Boolean(anchorEd)
  const id = open ? 'simple-popover' : undefined

  const getInputValues = (evt) => {
    setDescription(`${evt.target.value}`)
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

          <Tooltip title="Add Description">
            <IconButton aria-describedby={id} color="inherit" className={classes.tools} size="small" onClick={handleDiscClick} >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEd}
            onClose={handleDiscClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left'
            }}
          >
            <div style={{ padding: '5px' }} >
              <TextareaAutosize id='Description' label='Description' value={description || ''} onChange={getInputValues} rowsMin={5} aria-label='Description' placeholder={'Add Schematic Description'} style={{ width: '100%', minWidth: '250px', maxWidth: '300px' }} />
            </div>
          </Popover>
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

        {
          (!auth.isAuthenticated ? (<Button
            size="small"
            component={RouterLink}
            to="/login"
            color="primary"
            variant="outlined"
            className={classes.button}
          >
            Login
          </Button>)
            : (<>

              <IconButton
                edge="start"
                className={classes.button}
                style={{ marginLeft: 'auto' }}
                color="primary"
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleClick}
              >
                <AccountCircleRoundedIcon />
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
                  component={RouterLink}
                  to="/dashboard"
                  onClick={handleClose}
                >
                  <ListItemText primary={auth.user.username} secondary={auth.user.email}/>
                </MenuItem>
                <MenuItem
                  component={RouterLink}
                  to="/dashboard/profile"
                  onClick={handleClose}
                >
                  My Profile
                </MenuItem>
                <MenuItem
                  component={RouterLink}
                  to="/dashboard/schematics"
                  onClick={handleClose}
                >
                  My Schematics
                </MenuItem>
                <MenuItem onClick={() => {
                  store.dispatch(logout())
                }}>
                  Logout
                </MenuItem>
              </Menu>
            </>
            )
          )
        }
      </div>
    </Toolbar>
  )
}

export default Header
