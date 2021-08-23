import React, { useEffect } from 'react'
import {
  Button,
  Typography,
  IconButton,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import FilterListIcon from '@material-ui/icons/FilterList'
import queryString from 'query-string'
import api from '../../utils/Api'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import CompareGraph from './CompareGraph'

const useStyles = makeStyles({
  table: {
    minWidth: 650
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
  const [responseData, setResponseData] = React.useState([])
  const [sortData, setSortData] = React.useState([])
  const [sortOrderUser, setSortOrderUser] = React.useState(sortOrder.Unsorted)
  const [sortOrderTime, setSortOrderTime] = React.useState(sortOrder.Unsorted)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [open, setOpen] = React.useState(false)
  const [simResult, setSimResult] = React.useState(null)

  useEffect(() => {
    setSortData(responseData)
    console.log(responseData)
  }, [responseData])

  useEffect(() => {
    console.log(simResult)
  }, [simResult])

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
    api.get(`/lti/submissions/${url.id}/${url.version}/${url.branch}`, config)
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
      temp.sort((a, b) => {
        if (a.student.username > b.student.username) return -1
        else if (a.student.username < b.student.username) return 1
        return 0
      })
      setSortData(temp)
      setSortOrderUser(1)
    } else if (sortOrderUser === 1) {
      temp.sort((a, b) => {
        if (a.student.username < b.student.username) return -1
        else if (a.student.username > b.student.username) return 1
        return 0
      })
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

  const onSearch = (e) => {
    setSortData(responseData.filter((o) =>
      // eslint-disable-next-line
      Object.keys(o).some((k) => {
        if ((k === 'student') && String(o[k].username).toLowerCase().includes(e.target.value.toLowerCase())) {
          return String(o[k].username).toLowerCase().includes(e.target.value.toLowerCase())
        }
      }
      )
    ))
  }

  const handleFilterOpen = (e) => {
    if (anchorEl) {
      setAnchorEl(null)
    } else {
      setAnchorEl(e.currentTarget)
    }
  }

  const handleButtonClick = () => {
    var url = queryString.parse(window.location.href.split('submission')[1])
    window.location.href = `/eda/#/lti?id=${url.id}&version=${url.version}&branch=${url.branch}`
  }

  const handleSimOpen = (studentSim) => {
    setSimResult(studentSim)
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <IconButton onClick={handleFilterOpen} style={{ float: 'right' }} ><FilterListIcon /></IconButton>
      <Input style={{ float: 'right' }} onChange={(e) => onSearch(e)} placeholder='Search' />
      <Button style={{ float: 'left' }} disableElevation variant="contained" color="primary" onClick={handleButtonClick} startIcon={<ArrowBackIcon />}>
        Return to LTI App
      </Button>
      <TableContainer>
        {sortData.length !== 0 ? <>
          <Table className={classes.table} aria-label="submission table">
            <TableHead>
              <TableRow>
                <TableCell onClick={handleUserSort}>User {sortOrderUser === 1 ? <ArrowUpwardIcon fontSize="small" /> : sortOrderUser === 2 ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon color="disabled" fontSize="small" />}</TableCell>
                <TableCell align="center">User ID in LMS</TableCell>
                <TableCell onClick={handleTimeSort} align="center">Submitted at {sortOrderTime === 1 ? <ArrowUpwardIcon fontSize="small" /> : sortOrderTime === 2 ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon color="disabled" fontSize="small" />}</TableCell>
                <TableCell align="center">Submitted From</TableCell>
                <TableCell align="center">Score</TableCell>
                <TableCell align="center">Submission Circuit</TableCell>
                <TableCell align="center">Submission Simulation</TableCell>
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
                  <TableCell align="center">{student.ltisession.lis_outcome_service_url.split('/')[2]}</TableCell>
                  <TableCell align="center">{student.score}</TableCell>
                  <TableCell align="center">
                    <Button disableElevation variant="contained" color="primary" href={`#/editor?id=${student.schematic.save_id}&version=${student.schematic.version}&branch=${student.schematic.branch}`}>
                      Open Submission
                    </Button>
                  </TableCell>
                  <TableCell align="center">
                    <Button disableElevation variant="contained" color="primary" onClick={() => handleSimOpen(student.student_simulation)}>
                      Open Simulation Result
                    </Button>
                  </TableCell>

                </TableRow>
              }
              )}
            </TableBody>
          </Table>
          <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} fullScreen={simResult && simResult.result.graph === 'true'}>
            <DialogTitle id="customized-dialog-title" onClose={handleClose}>
              Student Simulation
            </DialogTitle>
            <DialogContent dividers>
              {simResult && simResult.result.graph === 'false' && simResult.result.data.map((ele, index) => (
                // eslint-disable-next-line
                <Typography>
                  {index + 1}. {ele[0]} : {ele[2]}
                </Typography>))}
              {simResult && simResult.result.graph === 'true' &&
                <CompareGraph given={simResult.result} />
                // <h1> Simulation is graphical and cannot be displayed here</h1>
              }
            </DialogContent>
            <DialogActions>
              <Button autoFocus onClick={handleClose} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </> : <Typography style={{ textAlign: 'center' }}><h1>No submissions for this assignment</h1></Typography>}
      </TableContainer>
    </>
  )
}
