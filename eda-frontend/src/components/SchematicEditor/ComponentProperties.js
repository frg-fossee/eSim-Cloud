import React from 'react'
import { useSelector } from 'react-redux'
import { ListItem, ListItemText, Button } from '@material-ui/core'

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
      <ListItem>
        <Button size='small' variant="contained" color="primary">ADD</Button>
      </ListItem>
    </div>
  )
}
