import React from "react";
import {
  Toolbar,
  Typography,
  IconButton,
  Button,
  Input,
  Hidden,
  Link,
} from "@material-ui/core";
import Description from "@material-ui/icons/Description";
import ShareIcon from "@material-ui/icons/Share";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  toolbarTitle: {
    marginRight: theme.spacing(2),
  },
  form: {
    flexGrow: 1,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    color: "#595959",
  },
  rightBlock: {
    marginLeft: "auto",
  },
  button: {
    marginRight: theme.spacing(1),
  },
}));

function Header() {
  const classes = useStyles();

  return (
    <Toolbar variant="dense" color="default">
      <IconButton edge="start" className={classes.button} color="primary">
        <Description />
      </IconButton>
      <Typography
        variant="h6"
        color="inherit"
        noWrap
        className={classes.toolbarTitle}
      >
        <Link color="inherit" target="_blank" href="/">
          EDA
        </Link>
      </Typography>

      <Hidden smDown>
        <form className={classes.form} noValidate autoComplete="off">
          <Input
            className={classes.input}
            defaultValue="Untitled_Schematic"
            color="secondary"
            inputProps={{ "aria-label": "SchematicTitle" }}
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
          href="/login"
          color="primary"
          variant="outlined"
          className={classes.button}
        >
          Login
        </Button>
      </div>
    </Toolbar>
  );
}

export default Header;
