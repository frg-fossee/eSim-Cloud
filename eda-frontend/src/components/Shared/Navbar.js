import React from "react";

import { AppBar, Button, Toolbar, Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: "wrap",
  },
  toolbarTitle: {
    flexGrow: 1,
  },
  link: {
    margin: theme.spacing(1, 1.5),
  },
}));

export default function Navbar() {
  const classes = useStyles();

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      className={classes.appBar}
    >
      <Toolbar className={classes.toolbar}>
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
        <Button
          href="/login"
          color="primary"
          variant="outlined"
          className={classes.link}
        >
          Login
        </Button>
      </Toolbar>
    </AppBar>
  );
}
