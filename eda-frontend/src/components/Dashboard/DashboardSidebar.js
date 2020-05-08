import React from "react";
import {
  Hidden,
  Divider,
  Avatar,
  List,
  Typography,
  ListItem,
  InputBase,
  ListItemText,
  ListItemAvatar,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { deepPurple } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: "45px",
  },
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
  },
  sideItem: {
    padding: theme.spacing(1.5, 2),
  },
  nested: {
    paddingLeft: theme.spacing(2),
    overflow: "auto",
    width: "100%",
    maxHeight: 200,
  },
  nestedSearch: {
    padding: theme.spacing(0),
    border: "1px solid #cccccc",
    margin: theme.spacing(1, 2),
    borderRadius: "5px",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
}));

export default function DashSidebar(props) {
  const classes = useStyles();

  return (
    <>
      <Hidden smDown>
        <div className={classes.toolbar} />
      </Hidden>

      <ListItem
        alignItems="flex-start"
        component={Link}
        to="/dashboard"
        style={{ marginTop: "15px" }}
        className={classes.sideItem}
        button
        divider
      >
        <ListItemAvatar>
          <Avatar className={classes.purple}>U</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary="User Name"
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

      <List>
        <ListItem
          component={Link}
          to="/dashboard/profile"
          className={classes.sideItem}
          button
          divider
        >
          My Profile
        </ListItem>
      </List>

      <List>
        <ListItem
          component={Link}
          to="/dashboard/schematics"
          className={classes.sideItem}
          button
        >
          My Schematics
        </ListItem>
        <List className={classes.nestedSearch} dense="true">
          <InputBase
            className={classes.input}
            placeholder="Find your schematic..."
          />
        </List>
        <List className={classes.nested} dense="true">
          {[0, 1, 2, 4, 5, 6, 7, 8].map((item) => (
            <ListItem key={`item-${item}`} button>
              <ListItemText primary={`Schematic ${item}`} />
            </ListItem>
          ))}
        </List>
        <Divider />
      </List>
    </>
  );
}
