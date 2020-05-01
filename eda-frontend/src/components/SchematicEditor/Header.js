import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Input,
} from "@material-ui/core";
import Description from "@material-ui/icons/Description";
import ShareIcon from "@material-ui/icons/Share";

const useStyles = makeStyles((theme) => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: "wrap",
  },
  toolbarTitle: {
    marginRight: theme.spacing(2),
  },
  form: {
    flexGrow: 1,
  },
  button: {
    marginRight: theme.spacing(1),
  },
}));

function Header() {
  const classes = useStyles();

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      className={classes.appBar}
    >
      <Toolbar variant="dense" color="default">
        <IconButton edge="start" className={classes.button} color="inherit">
          <Description />
        </IconButton>
        <Typography
          variant="h6"
          color="inherit"
          noWrap
          className={classes.toolbarTitle}
        >
          EDA
        </Typography>

        <form className={classes.form} noValidate autoComplete="off">
          <Input
            defaultValue="Untitled_Schematic"
            color="primary"
            inputProps={{ "aria-label": "SchematicTitle" }}
          />
        </form>

        <Button
          size="small"
          variant="contained"
          color="primary"
          className={classes.button}
          startIcon={<ShareIcon />}
        >
          Share
        </Button>

        <Button
          size="small"
          href="/login"
          color="primary"
          variant="outlined"
          className={classes.button}
        >
          Login
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
