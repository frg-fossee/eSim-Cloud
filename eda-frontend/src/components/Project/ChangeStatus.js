/* eslint-disable camelcase */
import { Button, Paper, InputLabel, Select, MenuItem, TextField } from '@material-ui/core'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getStatus, changeStatus } from '../../redux/actions'
import PropTypes from 'prop-types'

function ChangeStatus ({ project, changedStatus }) {
  const dispatch = useDispatch()
  const [status, setStatus] = React.useState(null)
  const [note, setNote] = React.useState('')
  const handleSelectChange = (event) => {
    setStatus(event.target.value)
  }
  const clickChangeStatus = () => {
    dispatch(changeStatus(project.details.project_id, status, note))
    changedStatus()
  }
  const onChangeNote = (e) => {
    setNote(e.target.value)
  }
  useEffect(() => {
    dispatch(getStatus(project.details?.project_id))
  }, [dispatch, project.details])
  return (
    <Paper>
      {project.states &&
                <div style={{ padding: ' 0 1% 1% 1%', textAlign: 'left' }}>
                  <br />
                  <h3 style={{ marginTop: '0' }}>Review the project and change it&apos;s state</h3>
                  <h3 style={{ marginTop: '0' }}>Current State : {project.details?.status_name}</h3>
                  <TextField
                    style={{ width: '50%', marginBottom: '2%' }}
                    placeholder='Reviewer Notes'
                    multiline
                    value={note}
                    onChange={onChangeNote}
                    rows={2} />
                  <InputLabel style={{ marginTop: '0' }}>Select and Change the status of this project</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    style={{ width: '50%' }}
                    onChange={handleSelectChange}
                    value={status}
                  >
                    {project.states.map((item, index) =>
                      (
                        <MenuItem key={item} value={item}>{item}</MenuItem>
                      ))}
                  </Select>
                  <Button style={{ float: 'right' }} variant='contained' color='primary' onClick={clickChangeStatus}>Change Status</Button>
                </div>
      }
    </Paper>
  )
}

ChangeStatus.propTypes = {
  project: PropTypes.object,
  changedStatus: PropTypes.func
}

export default ChangeStatus
