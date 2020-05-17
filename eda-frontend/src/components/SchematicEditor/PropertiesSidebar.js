import React from 'react'
import { Hidden, List, ListItem } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: "90px",
  },
}));

export default function PropertiesSidebar() {
  const classes = useStyles()

  return (
    <>
      <Hidden smDown>
        <div className={classes.toolbar} />
      </Hidden>
      <List>
        <ListItem button divider>
          <h2 style={{ margin: '5px' }}>Properties</h2>
        </ListItem>
      </List>
    </>
  )
}
