/* eslint-disable brace-style */
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCompProperties } from '../../redux/actions/index'
import Draggable from 'react-draggable'
import { List, ListItem, ListItemText, Button, TextField, TextareaAutosize, Paper } from '@material-ui/core'

export default function ComponentProperties () {
  // component properties that are displayed on the right side bar when user clicks on a component on the grid.

  const properties = useSelector(state => state.componentPropertiesReducer.compProperties)
  const isOpen = useSelector(state => state.componentPropertiesReducer.isPropertiesWindowOpen)
  const id = useSelector(state => state.componentPropertiesReducer.id)
  let x = useSelector(state => state.componentPropertiesReducer.x) + 50
  let y = useSelector(state => state.componentPropertiesReducer.y)
  const [height, setHeight] = useState(0)
  const [width, setWidth] = useState(0)
  const [val, setVal] = useState(properties)

  useEffect(() => {
    if (isOpen) {
      const temp = document.getElementById('properties-modal').clientHeight
      const temp2 = document.getElementById('properties-modal').clientWidth
      console.log(window.screen.width, temp2)
      console.log(x)
      if (0.6 * window.screen.height - 260 - y < temp) {
        if (temp + 100 >= y) {
          // eslint-disable-next-line
          y = 100 
        }
        else {
          // eslint-disable-next-line
          y = y - temp 
        }
      }
      if (x > window.screen.width - 547) {
        // eslint-disable-next-line
        x = x - 380
      }
      setHeight(y)
      setWidth(x)
    }
  }, [isOpen])

  const dispatch = useDispatch()

  useEffect(() => {
    setVal(properties)
  }, [properties])

  const getInputValues = (evt) => {
    const value = evt.target.value
    setVal({
      ...val,
      [evt.target.id]: value
    })
  }

  const setProps = () => {
    dispatch(setCompProperties(id, val))
  }

  return (
    isOpen &&
    <div id="properties-modal" style={{ position: 'absolute', left: `${width}px`, top: `${height}px` }}>
      <Draggable handle=".handle" bounds={{ left: 250 - width, right: window.screen.width - 550 - width, top: 100 - height, bottom: window.screen.height - 762 }}>
        <Paper>
          <List style={{ maxHeight: 500, maxWidth: 270, overflowY: 'scroll', overflowX: 'scroll' }}>
            <ListItem className="handle">
              <ListItemText style={{ cursor: 'move' }} primary='Component Properties' secondary={properties.NAME} />
            </ListItem>
            {
              Object.keys(properties).map((keyName, i) => {
                if (keyName === 'MODEL') {
                  return <ListItem key={i}>
                    <TextareaAutosize rowsMax={4} id={keyName} label={keyName} value={val[keyName] || ''} rowsMin={4} aria-label={keyName} onChange={getInputValues} placeholder={keyName} style={{ width: '100%' }} />
                  </ListItem>
                  // eslint-disable-next-line brace-style
                }
                else if (keyName === 'EXTRA_EXPRESSION') {
                  return <ListItem key={i}>
                    <TextareaAutosize rowsMax={4} id={keyName} label={keyName} value={val[keyName] || ''} rowsMin={4} aria-label={keyName} onChange={getInputValues} placeholder={'EXPRESSION'} style={{ width: '100%' }} />
                  </ListItem>
                }
                else if (keyName.charAt(0) === 'N' && keyName !== 'NAME') {
                  return <span key={i} />
                } else if (keyName.includes('UNIT')) {
                  return <span key={i} />
                }
                else if (keyName === 'PREFIX') {
                  return (
                    <ListItem key={i}>
                      <TextField id={keyName} label='LABEL' value={val[keyName] || ''} size='small' variant="outlined" onChange={getInputValues} />
                    </ListItem>)
                }
                else if (keyName === 'NAME') {
                  return (
                    <ListItem key={i}>
                      <TextField disabled id={keyName} label='COMPONENT NAME' value={val[keyName] || ''} size='small' variant="outlined" onChange={getInputValues} />
                    </ListItem>)
                }
                return (
                  <ListItem key={i}>
                    <TextField id={keyName} label={keyName} value={val[keyName] || ''} size='small' variant="outlined" onChange={getInputValues} />
                    {val[`${keyName}_UNIT`] && <span style={{ marginLeft: '10px' }}>{val[`${keyName}_UNIT`] || ''}</span>}
                  </ListItem>)
              })
            }
            <ListItem>
              <Button size='small' variant="contained" color="primary" onClick={setProps}>SET PARAMETERS</Button>
            </ListItem>
          </List>
        </Paper>
      </Draggable>
    </div>
  )
}
