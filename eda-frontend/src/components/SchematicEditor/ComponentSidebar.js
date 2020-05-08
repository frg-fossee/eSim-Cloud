import React from "react";
import { Hidden, List, ListItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  toolbar: {
    minHeight: "90px",
  },
});

export default function ComponentSidebar(props) {
  const classes = useStyles();

  return (
    <>
      <Hidden smDown>
        <div className={classes.toolbar} />
      </Hidden>

      {/* Display List of categorized components */}
      <List>
        <ListItem button divider>
          <h2 style={{ margin: "5px" }}>Components List</h2>
        </ListItem>
      </List>
    </>
  );
}
