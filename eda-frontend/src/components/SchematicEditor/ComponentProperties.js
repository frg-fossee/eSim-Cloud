import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCompProperties } from '../../redux/actions/componentPropertiesActions'
import { ListItem, ListItemText, Button, TextField } from '@material-ui/core'

export default function ComponentProperties () {
  const properties = useSelector(state => state.componentPropertiesReducer.compProperties)
  const id = useSelector(state => state.componentPropertiesReducer.id)
  const [val, setVal] = useState(properties)
  const dispatch = useDispatch()

  const getInputValues = (evt) => {
    const value = evt.target.value

    setVal({
      ...val,
      [evt.target.id]: value
    })
  }

  const setProps = () => {
    console.log('pressed')
    dispatch(setCompProperties(id, val))
  }

  console.log(val)
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
        <Button size='small' variant="contained" color="primary" onClick={setProps}>ADD</Button>
      </ListItem>

    </div>
  )
}
