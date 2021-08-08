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
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
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

const sortOrder = {
  Unsorted: 0,
  Ascending: 1,
  Descending: 2
}

export default function SubmissionTable () {
  const classes = useStyles()
  const [responseData, setResponseData] = React.useState(null)
  const [sortData, setSortData] = React.useState(null)
  const [sortOrderUser, setSortOrderUser] = React.useState(sortOrder.Unsorted)
  const [sortOrderTime, setSortOrderTime] = React.useState(sortOrder.Unsorted)

  useEffect(() => {
    setSortData(responseData)
  }, [responseData])

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
            if (!res.data[i].student) {
              res.data[i].student = {}
              res.data[i].student.username = 'Anonymous User'
            }
          }
          setResponseData(res.data)
        }
      )
      .catch((err) => { console.error(err) })
  }, [])

  const handleUserSort = () => {
    setSortOrderTime(0)
    var temp = responseData.slice()
    if (sortOrderUser === 0) {
      temp.sort((a, b) => a.student.username < b.student.username)
      setSortData(temp)
      setSortOrderUser(1)
    } else if (sortOrderUser === 1) {
      temp.sort((a, b) => a.student.username > b.student.username)
      setSortData(temp)
      setSortOrderUser(2)
    } else {
      setSortData(responseData)
      setSortOrderUser(0)
    }
  }

  const handleTimeSort = () => {
    setSortOrderUser(0)
    var temp = responseData.slice()
    if (sortOrderTime === 0) {
      temp.sort((a, b) => {
        if (a.schematic.save_time < b.schematic.save_time) return -1
        else if (a.schematic.save_time > b.schematic.save_time) return 1
        return 0
      })
      setSortData(temp)
      setSortOrderTime(1)
    } else if (sortOrderTime === 1) {
      temp.sort((a, b) => {
        if (a.schematic.save_time > b.schematic.save_time) return -1
        else if (a.schematic.save_time < b.schematic.save_time) return 1
        return 0
      })
      setSortData(temp)
      setSortOrderTime(2)
    } else {
      setSortData(responseData)
      setSortOrderTime(0)
    }
  }

  return (
    <TableContainer>
      {sortData ? <Table className={classes.table} aria-label="submission table">
        <TableHead>
          <TableRow>
            <TableCell onClick={handleUserSort}>User {sortOrderUser === 1 ? <ArrowUpwardIcon fontSize="small" /> : sortOrderUser === 2 ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon color="disabled" fontSize="small" />}</TableCell>
            <TableCell align="center">User ID in LMS</TableCell>
            <TableCell onClick={handleTimeSort} align="center">Submitted at {sortOrderTime === 1 ? <ArrowUpwardIcon fontSize="small" /> : sortOrderTime === 2 ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon color="disabled" fontSize="small" />}</TableCell>
            <TableCell align="center">Submitted From</TableCell>
            <TableCell align="center">Score</TableCell>
            <TableCell align="center">Submissions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortData.map((student) => {
            return <TableRow key={student.schematic.save_id}>
              <TableCell component="th" scope="row">
                {student.student.username}
              </TableCell>
              <TableCell align="center">{student.ltisession.user_id}</TableCell>
              <TableCell align="center">{student.schematic.save_time.toLocaleString()}</TableCell>
              <TableCell align="center">{student.ltisession.lis_outcome_service_url}</TableCell>
              <TableCell align="center">{student.score}</TableCell>
              <TableCell align="center">
                <Button disableElevation variant="contained" color="primary" href={`#/editor?id=${student.schematic.save_id}`}>
                  Open Submission
                </Button>
              </TableCell>
            </TableRow>
          }
          )}
        </TableBody>
      </Table> : <Typography style={{ textAlign: 'center' }}><h1>No submissions for this assignment</h1></Typography>}
    </TableContainer>
  )
}
