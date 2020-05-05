import React from "react";
import { Typography, Link, IconButton } from "@material-ui/core";
import AccountCircleRoundedIcon from "@material-ui/icons/AccountCircleRounded";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  toolbarTitle: {
    flexGrow: 1,
  },
  link: {
    margin: theme.spacing(1, 1.5),
  },
}));

export default function Header() {
  const classes = useStyles();

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
      <IconButton edge="start" className={classes.button} color="primary">
        <AccountCircleRoundedIcon />
      </IconButton>
    </>
  );
}
