import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCompProperties, setModel } from '../../redux/actions/index'
import { ListItem, ListItemText, Button, TextField, TextareaAutosize } from '@material-ui/core'

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
    dispatch(setModel(val.MODEL))
    // setVal({})
  }

  // const [open, setOpen] = React.useState(false)

  // const handleClickOpen = () => {
  //   setOpen(true)
  // }

  // const handleClose = () => {
  //   setOpen(false)
  // }

  return (

    <div style={isOpen ? {} : { display: 'none' }}>

      <ListItem>
        <ListItemText primary='Component Properties' secondary={properties.NAME} />
      </ListItem>
      {
        Object.keys(properties).map((keyName, i) => {
          if (keyName === 'MODEL') {
            return <ListItem key={i}>
              <TextareaAutosize id={keyName} label={keyName} value={val[keyName] || ''} rowsMin={4} aria-label={keyName} onChange={getInputValues} placeholder={keyName} style={{ width: '100%' }} />
            </ListItem>
          }
          // if (keyName === 'MODEL') {
          //   return (
          //     <div>
          //       <ListItem key={i}>
          //         <Button size="small" variant="outlined" color="primary" onClick={handleClickOpen}>
          //         ADD MODEL
          //         </Button>

          //       </ListItem>

          //       <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
          //         <DialogTitle id="form-dialog-title">ADD MODEL</DialogTitle>
          //         <DialogContent>
          //           <ListItem key={i}>
          //             <TextareaAutosize id={keyName} label={keyName} value={val[keyName] || ''} rowsMin={4} aria-label={keyName} onChange={getInputValues} placeholder={'ADD EXPRESSION'} style={{ width: '100%' }} />
          //           </ListItem>
          //         </DialogContent>
          //         <DialogActions>
          //           <Button onClick={handleClose} color="primary">
          //             Cancel
          //           </Button>
          //           <Button onClick={handleClose} color="primary">
          //             Add
          //           </Button>
          //         </DialogActions>
          //       </Dialog>
          //     </div>
          //   )
          // }
          else if (keyName === 'EXTRA_EXPRESSION') {
            return <ListItem key={i}>
              <TextareaAutosize id={keyName} label={keyName} value={val[keyName] || ''} rowsMin={4} aria-label={keyName} onChange={getInputValues} placeholder={'ADD EXPRESSION'} style={{ width: '100%' }} />
            </ListItem>
          }

          // else if (keyName === 'EXTRA_EXPRESSION') {
          //   return (

          //     <div>
          //       <ListItem key={i}>
          //         <Button size="small" variant="outlined" color="primary" onClick={handleClickOpen}>
          //         ADD EXPRESSION
          //         </Button>

          //       </ListItem>

          //       <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
          //         <DialogTitle id="form-dialog-title">ADD EXPRESSION</DialogTitle>
          //         <DialogContent>
          //           <ListItem key={i}>
          //             <TextareaAutosize id={keyName} label={keyName} value={val[keyName] || ''} rowsMin={4} aria-label={keyName} onChange={getInputValues} placeholder={'ADD EXPRESSION'} style={{ width: '100%' }} />
          //           </ListItem>
          //         </DialogContent>
          //         <DialogActions>
          //           <Button onClick={handleClose} color="primary">
          //             Cancel
          //           </Button>
          //           <Button onClick={handleClose} color="primary">
          //             Add
          //           </Button>
          //         </DialogActions>
          //       </Dialog>
          //     </div>

          //   )
          // }
          else if (keyName.charAt(0) === 'N' && keyName !== 'NAME') {
            return <span key={i} />
          } else if (keyName === 'UNIT') {
            return <span key={i} />
          } else if (keyName === 'VALUE') {
            return (
              <ListItem key={i}>
                <TextField id={keyName} label={keyName} value={val[keyName] || ''} size='small' variant="outlined" onChange={getInputValues} />
                <span style={{ marginLeft: '10px' }}>{val.UNIT || ''}</span>
              </ListItem>)
          }

          return (
            <ListItem key={i}>
              <TextField id={keyName} label={keyName} value={val[keyName] || ''} size='small' variant="outlined" onChange={getInputValues} />
            </ListItem>)
        })
      }

      <ListItem>
        <Button size='small' variant="contained" color="primary" onClick={setProps}>SET PARAMETERS</Button>
      </ListItem>

    </div>
  )
}
