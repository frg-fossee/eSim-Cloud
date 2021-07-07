import React, { useEffect } from 'react'
import {
  Button,
  Typography
} from '@material-ui/core'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { makeStyles } from '@material-ui/core/styles'
import queryString from 'query-string'
import api from '../../utils/Api'

const useStyles = makeStyles({
  table: {
    minWidth: 650
  },
  mainHead: {
    width: '100%',
    backgroundColor: '#404040',
    color: '#fff'
  },
  title: {
    fontSize: 14,
    color: '#80ff80'
  }
})

export default function SubmissionTable () {
  const classes = useStyles()
  const [responseData, setResponseData] = React.useState('')

  useEffect(() => {
    var url = queryString.parse(window.location.href.split('submission')[1])
    const token = localStorage.getItem('esim_token')
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    api.get(`/lti/submissions/${url.consumer_key}`, config)
      .then(
        (res) => {
          for (var i = 0; i < res.data.length; i++) {
            res.data[i].schematic.save_time = new Date(res.data[i].schematic.save_time)
          }
          setResponseData(res.data)
        }
      )
      .catch((err) => { console.error(err) })
  }, [])

  return (
    <TableContainer>
      {responseData.length > 0 ? <Table className={classes.table} aria-label="submission table">
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell align="center">Created at</TableCell>
            <TableCell align="center">Score</TableCell>
            <TableCell align="center">Submissions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {responseData.map((student) => (
            <TableRow key={student.ltisession.id}>
              <TableCell component="th" scope="row">
                {student.student ? student.student.username : 'Anonymous User'}
              </TableCell>
              <TableCell align="center">{student.schematic.save_time.toUTCString()}</TableCell>
              <TableCell align="center">{student.score}</TableCell>
              <TableCell align="center">
                <Button disableElevation variant="contained" color="primary" href={`#/editor?id=${student.schematic.save_id}`}>
                  Open Submission
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table> : <Typography style={{ textAlign: 'center' }}><h1>No submissions for this assignment</h1></Typography>}
    </TableContainer>
  )
}
