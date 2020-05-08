import React from "react";
import {
  Typography,
  Link,
  IconButton,
  Hidden,
  Menu,
  MenuItem,
  Fade,
} from "@material-ui/core";
import AccountCircleRoundedIcon from "@material-ui/icons/AccountCircleRounded";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  toolbarTitle: {
    marginRight: theme.spacing(3),
  },
  link: {
    margin: theme.spacing(1, 1.5),
  },
}));

export default function Header() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Typography
        variant="h6"
        color="inherit"
        noWrap
        className={classes.toolbarTitle}
      >
        <Link color="inherit" href="/">
          EDA Cloud
        </Link>
      </Typography>
      <Hidden smDown>
        <nav>
          <Link
            variant="button"
            color="textPrimary"
            href="/"
            className={classes.link}
          >
            Home
          </Link>
          <Link
            variant="button"
            color="textPrimary"
            href="/editor"
            className={classes.link}
          >
            Editor
          </Link>
          <Link
            variant="button"
            color="textPrimary"
            href="/simulator"
            className={classes.link}
          >
            Simulator
          </Link>
          <Link
            variant="button"
            color="textPrimary"
            href="/dashboard"
            className={classes.link}
          >
            Dashboard
          </Link>
        </nav>
      </Hidden>
      <IconButton
        edge="start"
        className={classes.button}
        style={{ marginLeft: "auto" }}
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
        style={{ marginTop: "25px" }}
      >
        <MenuItem onClick={handleClose}>My Profile</MenuItem>
        <MenuItem onClick={handleClose}>My Schematics</MenuItem>
        <MenuItem onClick={handleClose}>Settings</MenuItem>
        <MenuItem component="Link" href="/login" onClick={handleClose}>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
