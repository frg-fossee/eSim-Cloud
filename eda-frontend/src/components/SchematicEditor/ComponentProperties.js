import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCompProperties } from '../../redux/actions/componentPropertiesActions'
import { ListItem, ListItemText, Button, TextField, Dialog, DialogTitle, DialogContent, Typography, TextareaAutosize, Slide, DialogActions } from '@material-ui/core'

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default function ComponentProperties () {
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
    setVal({})
  }

  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (

    <div style={isOpen ? {} : { display: 'none' }}>

      <ListItem>
        <ListItemText primary='Component Properties' secondary={properties.NAME} />
      </ListItem>
      {
        Object.keys(properties).map((keyName, i) => {
          if (keyName === 'MODEL') {
            return <span key={i}/>
          } else if (keyName === 'EXTRA_EXPRESSION') {
            return <span key={i}/>
          }
          return <ListItem key={i}>
            <TextField id={keyName} label={keyName} value={val[keyName] || ''} size='small' variant="outlined" onChange={getInputValues} />
          </ListItem>
        })
      }

      <ListItem>
        <Button size='small' variant="contained" color="primary" onClick={setProps}>ADD</Button>
        <Button size='small' variant="contained" color="primary" style={{ marginLeft: 'auto' }} onClick={handleClickOpen}>EXTRA PARAM</Button>
        <Dialog
          open={open}
          onClose={handleClose}
          style={{ padding: '30px' }}
          TransitionComponent={Transition}
          keepMounted
          aria-labelledby="params-dialog-title"
          aria-describedby="params-dialog-description"
        >
          <DialogTitle id="params-dialog-title">{'Componenent Extra Parameters'}</DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1" gutterBottom>
              {'Enter Extra Parameters'}
            </Typography>
            <TextareaAutosize aria-label="ExtraParameters" rowsMin={5} rowsMax={8} style={{ minWidth: '400px' }} />
            <Typography variant="subtitle1" gutterBottom>
              Enter Model
            </Typography>
            <TextareaAutosize aria-label="SpiceModel" rowsMin={5} rowsMax={8} style={{ minWidth: '400px' }} />
          </DialogContent>
          <DialogActions>
            <Button color="primary">
              ADD
            </Button>
            <Button onClick={handleClose} color="primary" autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </ListItem>

    </div>
  )
}
