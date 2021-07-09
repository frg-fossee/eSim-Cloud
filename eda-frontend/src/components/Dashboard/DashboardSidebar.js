import React, { useEffect } from 'react'
import {
  Hidden,
  Divider,
  Avatar,
  List,
  Typography,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@material-ui/core'
import { Link as RouterLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { deepPurple } from '@material-ui/core/colors'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSchematics, fetchOtherProjects, fetchRole } from '../../redux/actions/index'
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
  const dispatch = useDispatch()
  // For Fetching Saved Schematics
  useEffect(() => {
    dispatch(fetchSchematics())
    dispatch(fetchOtherProjects())
    dispatch(fetchRole())
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
                  {auth.roles !== null && auth.roles.group.map((value, key) => (<h3 key={value}>{value}</h3>))}
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
          <ListItemText primary='My Profile' />
        </ListItem>
        <ListItem
          component={RouterLink}
          to="/dashboard/schematics"
          className={classes.sideItem}
          button
        >
          <ListItemText primary='My Schematics' />
        </ListItem>
        <Divider />
        {auth.roles && auth.roles.e_sim_reviewer &&
          <ListItem
            component={RouterLink}
            to="/dashboard/review_projects"
            className={classes.sideItem}
            button
          >
            <ListItemText primary='Review Projects' />
          </ListItem>}

      </List>
    </>
  )
}
