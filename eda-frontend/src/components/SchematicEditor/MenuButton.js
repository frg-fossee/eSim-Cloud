import React from 'react';
import {  IconButton, Menu, MenuItem, Fade } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  tools: {
    padding: theme.spacing(1),
    margin: theme.spacing(0, 0.5),
    color: '#404040'
  }
});

class MenuButton extends React.Component {
  state = {
    anchorEl: null
  };

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);
    const Wrapper = this.props.iconType;
    const listItems = this.props.items.map((link) =>
      <MenuItem onClick={this.handleClose} >{link}</MenuItem>
    );

    return (
      <>
        <IconButton
          aria-owns={open ? 'menu-toolbar' : null}
          aria-haspopup="true"
          onClick={this.handleMenu}
          color="inherit"
          className={classes.tools}
          size="small"
        >
          {<Wrapper fontSize="small" />}
        </IconButton>
        <Menu
          id="menu-toolbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          open={open}
          style={{ marginTop: "48px" }}
          TransitionComponent={Fade}
          onClose={this.handleClose}
        >
          {listItems}
        </Menu>
      </>
    );
  }
}

export default withStyles(styles, { withTheme: true })(MenuButton);