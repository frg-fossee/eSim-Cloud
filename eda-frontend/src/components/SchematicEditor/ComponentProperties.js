import React from 'react'
import { useSelector } from 'react-redux'
import { ListItem, ListItemText, Button, TextField } from '@material-ui/core'

export default function ComponentProperties () {
  const properties = useSelector(state => state.componentPropertiesReducer.compProperties)

  return (
    <div>
      <ListItem>
        <ListItemText primary='Component Properties' />
      </ListItem>
      <ListItem>
        <ListItemText primary={properties.FNAME} />
      </ListItem>
      {
        Object.keys(properties).map((keyName, i) => (
          <ListItem key={i}>
            <TextField id={keyName} label={keyName} value={properties[keyName]} size='small' variant="outlined" />
          </ListItem>
        ))
      }
      <ListItem>
        <Button size='small' variant="contained" color="primary">ADD</Button>
      </ListItem>
    </div>
  )
}
