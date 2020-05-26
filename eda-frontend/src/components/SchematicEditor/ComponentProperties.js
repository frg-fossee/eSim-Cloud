import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { ListItem, ListItemText, Button, TextField } from '@material-ui/core'

export default function ComponentProperties () {
  const properties = useSelector(state => state.componentPropertiesReducer.compProperties)

  const [val, setVal] = useState(properties)

  const getInputValues = (evt) => {
    console.log(evt.target.value)
    const value = evt.target.value

    setVal({
      ...val,
      [evt.target.id]: value
    })
  }
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
            <TextField id={keyName} label={keyName} value={val[keyName]} size='small' variant="outlined" onChange={getInputValues} />
          </ListItem>
        ))
      }

      <ListItem>
        <Button size='small' variant="contained" color="primary">ADD</Button>
      </ListItem>

    </div>
  )
}
