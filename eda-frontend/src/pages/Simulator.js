import React, { useState, useEffect } from 'react'
import { Container, Grid, Button, Paper, Typography, Switch, FormControlLabel } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Editor from '../components/Simulator/Editor'
import textToFile from '../components/Simulator/textToFile'
import SimulationScreen from '../components/Shared/SimulationScreen'
import { useDispatch } from 'react-redux'
import { setResultGraph, setResultText, setNetlist } from '../redux/actions/index'
import Notice from '../components/Shared/Notice'

import api from '../utils/Api'

const useStyles = makeStyles((theme) => ({
  header: {
    padding: theme.spacing(5, 0, 6)
    // color: '#fff'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    backgroundColor: '#404040',
    color: '#fff'

  }
}))

export default function Simulator () {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [netlistCode, setNetlistCode] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [err, setErr] = useState(false)
  const [status, setStatus] = useState('')
  const stats = { loading: 'loading', error: 'error', success: 'success' }
  const [state, setState] = React.useState({
    checkedA: false

  })
  const [taskId, setTaskId] = useState(null)

  useEffect(() => {
    document.title = 'Simulator - eSim '
  })

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked })
  }

  const handleSimulationButtonClick = () => {
    prepareNetlist()
  }
  const onCodeChange = (code) => {
    setNetlistCode(code)
  }

  const [simulateOpen, setSimulateOpen] = React.useState(false)

  const handleErrOpen = () => {
    setErr(true)
  }
  const handleErrClose = () => {
    setErr(false)
  }
  const handleErrMsg = (msg) => {
    setErrMsg(msg)
  }
  const handleStatus = (status) => {
    setStatus(status)
  }
  const handlesimulateOpen = () => {
    setSimulateOpen(true)
  }

  const handleSimulateClose = () => {
    setSimulateOpen(false)
  }

  const netlistCodeSanitization = (code) => {
    const codeArray = code.split('\n')
    let cleanCode = ''
    let frontPlot = ''
    for (let line = 0; line < codeArray.length; line++) {
      if (codeArray[line].includes('plot') && !codeArray[line].includes('setplot')) {
        frontPlot += codeArray[line].split('plot ')[1] + ' '
      }
    }
    frontPlot = `print ${frontPlot} > data.txt \n`
    let flag = 0
    for (let i = 0; i < codeArray.length; i++) {
      if (codeArray[i].includes('plot') && !codeArray[i].includes('setplot')) {
        if (!flag) {
          cleanCode += frontPlot
          flag = 1
        }
      } else {
        cleanCode += codeArray[i] + '\n'
      }
    }
    return cleanCode
  }

  function prepareNetlist () {
    const sanatizedText = netlistCodeSanitization(netlistCode)
    dispatch(setNetlist(sanatizedText))
    const file = textToFile(sanatizedText)
    sendNetlist(file)
  }

  // Upload the nelist
  function netlistConfig (file) {
    const token = localStorage.getItem('esim_token')
    const formData = new FormData()
    formData.append('file', file)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return api.post('simulation/upload', formData, config)
  }

  function sendNetlist (file) {
    setIsResult(false)
    netlistConfig(file)
      .then((response) => {
        const res = response.data
        const getUrl = 'simulation/status/'.concat(res.details.task_id)
        setTaskId(res.details.task_id)
        simulationResult(getUrl)
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  const [isResult, setIsResult] = useState(false)

  function simulationResult (url) {
    let isError = false
    let msg
    let resPending = true // to stop immature opening of simulation screen
    api
      .get(url)
      .then((res) => {
        if (res.data.state === 'PROGRESS' || res.data.state === 'PENDING') {
          handleStatus(stats.loading)
          setTimeout(simulationResult(url), 1000)
        } else if (Object.prototype.hasOwnProperty.call(res.data.details, 'fail')) {
          resPending = false
          setIsResult(false)
          console.log('failed notif')
          console.log(res.data.details)
          msg = res.data.details.fail.replace("b'", '')
          isError = true
          console.log(err)
        } else {
          const result = res.data.details
          resPending = false
          if (result === null) {
            setIsResult(false)
          } else {
            const temp = res.data.details.data

            const data = result.data
            if (res.data.details.graph === 'true') {
              const simResultGraph = { labels: [], x_points: [], y_points: [] }
              // populate the labels
              for (let i = 0; i < data.length; i++) {
                simResultGraph.labels[0] = data[i].labels[0]
                const lab = data[i].labels
                // lab is an array containeing labels names ['time','abc','def']
                simResultGraph.x_points = data[0].x

                // labels
                for (let x = 1; x < lab.length; x++) {
                //   if (lab[x].includes('#branch')) {
                //     lab[x] = `I (${lab[x].replace('#branch', '')})`
                //   }
                  //  uncomment below if you want label like V(r1.1) but it will break the graph showing time as well
                  //  else {
                  // lab[x] = `V (${lab[x]})`

                  // }
                  simResultGraph.labels.push(lab[x])
                }
                // populate y_points
                for (let z = 0; z < data[i].y.length; z++) {
                  simResultGraph.y_points.push(data[i].y[z])
                }
              }

              simResultGraph.x_points = simResultGraph.x_points.map(d => parseFloat(d))

              for (let i1 = 0; i1 < simResultGraph.y_points.length; i1++) {
                simResultGraph.y_points[i1] = simResultGraph.y_points[i1].map(d => parseFloat(d))
              }
              dispatch(setResultGraph(simResultGraph))
            } else {
              const simResultText = []
              for (let i = 0; i < temp.length; i++) {
                let postfixUnit = ''
                if (temp[i][0].includes('#branch')) {
                  postfixUnit = 'A'
                } else if (temp[i][0].includes('transfer_function')) {
                  postfixUnit = ''
                } else if (temp[i][0].includes('impedance')) {
                  postfixUnit = 'Ohm'
                } else {
                  temp[i][0] = `V(${temp[i][0]})`
                  postfixUnit = 'V'
                }

                simResultText.push(temp[i][0] + ' ' + temp[i][1] + ' ' + parseFloat(temp[i][2]) + ' ' + postfixUnit + '\n')
              }
              // handleSimulationResult(res.data.details)
              dispatch(setResultText(simResultText))
            }
            setIsResult(true)
          }
        }
      })
      .then((res) => {
        if (isError === false && resPending === false) {
          // console.log('no error')
          handleStatus(stats.success)
          handlesimulateOpen()
        } else if (resPending === false) {
          handleStatus(stats.error)
          handleErrMsg(msg)

          // console.log('reached error alert')
          // console.log(msg)
          // alert(msg)
        }
        handleErrOpen()
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  return (
    <Container maxWidth="lg" className={classes.header}>
      <SimulationScreen open={simulateOpen} isResult={isResult} close={handleSimulateClose} dark={state} taskId={taskId} />
      <Grid
        container
        spacing={3}
        direction="row"
        justify="center"
        alignItems="stretch"
      >
        <Notice status={status} open={err} msg={errMsg} close={handleErrClose}/>
        <Grid item xs={12} >
          <Paper className={classes.paper}>

            <Typography variant="h4" gutterBottom>
              SPICE SIMULATOR
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              eSim on Cloud - ngSpice Simulator
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} >
          <Paper className={classes.paper}>

            <Typography variant="h5" gutterBottom>
              Enter Netlist

            </Typography>
            <FormControlLabel
              style={{ marginLeft: '10px' }}
              control={<Switch checked={state.checkedA} color="primary" onChange={handleChange} name="checkedA" />}
              label="Light Mode"
            />

            <Editor code={netlistCode} onCodeChange={onCodeChange} dark={state} />
            <br />

            <Button variant="contained" color="primary" size="large" onClick={handleSimulationButtonClick}>
              Simulate
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
