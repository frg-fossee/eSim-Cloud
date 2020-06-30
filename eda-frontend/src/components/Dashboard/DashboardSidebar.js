import React, { useEffect } from 'react'
import {
  Hidden,
  Divider,
  Avatar,
  List,
  Typography,
  ListItem,
  InputBase,
  ListItemText,
  ListItemAvatar
} from '@material-ui/core'
import { Link as RouterLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { deepPurple } from '@material-ui/core/colors'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSchematics } from '../../redux/actions/index'

const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: '45px'
  },
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500]
  },
  sideItem: {
    padding: theme.spacing(1.5, 2)
  },
  nested: {
    paddingLeft: theme.spacing(2),
    overflow: 'auto',
    width: '100%',
    maxHeight: 200
  },
  nestedSearch: {
    padding: theme.spacing(0),
    border: '1px solid #cccccc',
    margin: theme.spacing(1, 2),
    borderRadius: '5px'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  }
}))

// Vertical Navbar for user dashboard
export default function DashSidebar (props) {
  const classes = useStyles()
  const auth = useSelector(state => state.authReducer)
  const schematics = useSelector(state => state.dashboardReducer.schematics)

  const dispatch = useDispatch()

  // For Fetching Saved Schematics
  useEffect(() => {
    dispatch(fetchSchematics())
  }, [dispatch])

  return (
    <>
      <Hidden smDown>
        <div className={classes.toolbar} />
      </Hidden>
      <List>
        <ListItem
          alignItems="flex-start"
          component={RouterLink}
          to="/dashboard"
          style={{ marginTop: '15px' }}
          className={classes.sideItem}
          button
          divider
        >
          <ListItemAvatar>
            <Avatar className={classes.purple}>
              {auth.user.username.charAt(0).toUpperCase()}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={auth.user.username}
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  color="textSecondary"
                >
                  Contributor
                </Typography>
              </React.Fragment>
            }
          />
        </ListItem>

        <ListItem
          component={RouterLink}
          to="/dashboard/profile"
          className={classes.sideItem}
          button
          divider
        >
          <ListItemText primary='My Profile'/>
        </ListItem>
        <ListItem
          component={RouterLink}
          to="/dashboard/schematics"
          className={classes.sideItem}
          button
        >
          <ListItemText primary='My Schematics'/>
        </ListItem>

        {/* List name of saved schematics */}
        <List className={classes.nestedSearch} >
          <InputBase
            className={classes.input}
            placeholder="Find your schematic..."
          />
        </List>
        <div className={classes.nested} >
          {schematics.map((sch) => (
            <ListItem key={sch.save_id} button>
              <ListItemText primary={`${sch.name}`} />
            </ListItem>
          ))}
        </div>
        <Divider />
      </List>
    </>
  )
}
