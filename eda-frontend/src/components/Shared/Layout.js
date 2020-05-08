import React from "react";
import { AppBar, IconButton, Toolbar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";

import LayoutSidebar from "./LayoutSidebar";

const useStyles = makeStyles((theme) => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    zIndex: theme.zIndex.drawer + 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
}));

function Layout(props) {
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Header and Toolbar of Dashboard and Schematic Editor */}
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        className={classes.appBar}
      >
        {props.header}

        <Toolbar variant="dense" color="default">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>

          {props.resToolbar}
        </Toolbar>
      </AppBar>

      {/* Left Sidebar for Layout */}
      <LayoutSidebar mobileOpen={mobileOpen} mobileClose={handleDrawerToggle}>
        {props.sidebar}
      </LayoutSidebar>
    </>
  );
}

export default Layout;
