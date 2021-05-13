import { Button, Paper, InputLabel, Select, MenuItem } from '@material-ui/core'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getStatus, changeStatus } from '../../redux/actions'

function ChangeStatus({ publication }) {
    const dispatch = useDispatch()
    const [status, setStatus] = React.useState(null)
    const handleSelectChange = (event) => {
        setStatus(event.target.value)
    };
    const clickChangeStatus = () => {
        dispatch(changeStatus(publication.details.publication_id, status))
    }
    useEffect(() => {
        dispatch(getStatus(publication.details?.publication_id))
    }, [dispatch])
    return (
        <Paper>
            {publication.states &&
                <div style={{ textAlign: 'left' }}>
                    <br />
                    <InputLabel id="demo-simple-select-label">Change Status</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        style={{ width: '50%' }}
                        onChange={handleSelectChange}
                        value={status}
                    >
                        {publication.states.map((item, index) =>
                        (
                            <MenuItem value={item}>{item}</MenuItem>
                        ))}
                    </Select>
                    <Button onClick={clickChangeStatus}>Change Status</Button>
                </div>
            }
        </Paper>
    )
}

export default ChangeStatus
