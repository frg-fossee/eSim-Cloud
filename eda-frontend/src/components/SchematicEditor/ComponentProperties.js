/* eslint-disable brace-style */
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCompProperties } from '../../redux/actions/index'
import { ListItem, ListItemText, Button, TextField, TextareaAutosize, Paper } from '@material-ui/core'

export default function ComponentProperties () {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scroll, setScroll] = useState(0)
  const [scrolling, setScrolling] = useState(false)

  useEffect(() => {
    addEventListeners()
    return () => removeEventListeners()
  })

  const addEventListeners = () => {
    document.addEventListener("mousemove", onMouseMove)
    window.addEventListener("scroll", handleScroll)
  }

  const removeEventListeners = () => {
    document.removeEventListener("mousemove", onMouseMove)
    window.removeEventListener("scroll", handleScroll)
  }

  const onMouseMove = (e) => {
    if(!isOpen)
    setPosition({ x: e.clientX+50, y: e.clientY-150 })
  }

  const handleScroll = (e) => {
    console.log(window.scrollY)
    setScrolling(true)
    var temp = window.scrollY
    setScroll(temp)
  }
  // component properties that are displayed on the right side bar when user clicks on a component on the grid.

  const properties = useSelector(state => state.componentPropertiesReducer.compProperties)
  const isOpen = useSelector(state => state.componentPropertiesReducer.isPropertiesWindowOpen)
  const id = useSelector(state => state.componentPropertiesReducer.id)
  const [val, setVal] = useState(properties)

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

    <div style={isOpen ? scrolling ? {display: 'none'} : {position:'fixed', left: `${position.x}px`, top: `${position.y}px`} : { display: 'none' }}>
      <Paper>

      <ListItem>
        <ListItemText primary='Component Properties' secondary={properties.NAME} />
      </ListItem>

      {
        Object.keys(properties).map((keyName, i) => {
          if (keyName === 'MODEL') {
            return <ListItem key={i}>
              <TextareaAutosize id={keyName} label={keyName} value={val[keyName] || ''} rowsMin={4} aria-label={keyName} onChange={getInputValues} placeholder={keyName} style={{ width: '100%' }} />
            </ListItem>
            // eslint-disable-next-line brace-style
          }

          else if (keyName === 'EXTRA_EXPRESSION') {
            return <ListItem key={i}>
              <TextareaAutosize id={keyName} label={keyName} value={val[keyName] || ''} rowsMin={4} aria-label={keyName} onChange={getInputValues} placeholder={'EXPRESSION'} style={{ width: '100%' }} />
            </ListItem>
          }

          //
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
      </Paper>

    </div>
  )
}
