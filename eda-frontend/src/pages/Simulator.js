import React, { useState, useEffect } from 'react'
import { Container, Grid, Button, Paper, Typography, Switch, FormControlLabel } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Editor from '../components/Simulator/Editor'
import textToFile from '../components/Simulator/textToFile'
import SimulationScreen from '../components/Simulator/SimulationScreen'
import { useDispatch } from 'react-redux'
import { setResultGraph, setResultText } from '../redux/actions/index'

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
  const [state, setState] = React.useState({
    checkedA: false

  })

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
  const handlesimulateOpen = () => {
    setSimulateOpen(true)
  }

  const handleSimulateClose = () => {
    setSimulateOpen(false)
  }

  const netlistCodeSanitization = (code) => {
    var code_array = code.split('\n')
    var cleanCode = ""
    for(var line=0; line<code_array.length; line++) {
      if (code_array[line].includes("plot")){
        var code_words = code_array[line].split(" ").filter(function(str) {
          return /\S/.test(str)
        })
        var all_plots = ""
        for(var word=1;word<code_words.length; word++){
          all_plots = all_plots + " " + code_words[word] + " "
        }
        cleanCode += "print " + all_plots + " > data.txt \n "
      }
      else{
        cleanCode += code_array[line] + " \n "
      }
    }
    return cleanCode
  }

  function prepareNetlist () {
    var sanatizedText = netlistCodeSanitization(netlistCode)
    var file = textToFile(sanatizedText)
    sendNetlist(file)
  }

  // Upload the nelist
  function netlistConfig (file) {
    const formData = new FormData()
    formData.append('file', file)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    return api.post('simulation/upload', formData, config)
  }

  function sendNetlist (file) {
    netlistConfig(file)
      .then((response) => {
        const res = response.data
        const getUrl = 'simulation/status/'.concat(res.details.task_id)
        simulationResult(getUrl)
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  const [isResult, setIsResult] = useState(false)

  function simulationResult (url) {
    api
      .get(url)
      .then((res) => {
        if (res.data.state === 'PROGRESS' || res.data.state === 'PENDING') {
          setTimeout(simulationResult(url), 1000)
        } else {
          var result = res.data.details
          if (result === null) {
            setIsResult(false)
          } else {
            setIsResult(true)
            var temp = res.data.details.data

            var data = result.data
            if (res.data.details.graph === 'true') {
              var simResultGraph = { labels: [], x_points: [], y_points: [] }
              // populate the labels
              for (var i = 0; i < data.length; i++) {
                simResultGraph.labels[0] = data[i].labels[0]
                var lab = data[i].labels
                // lab is an array containeing labels names ['time','abc','def']
                simResultGraph.x_points = data[0].x

                // labels
                for (var x = 1; x < lab.length; x++) {
                  if (lab[x].includes('#branch')) {
                    lab[x] = `I (${lab[x].replace('#branch', '')})`
                  }
                  //  uncomment below if you want label like V(r1.1) but it will break the graph showing time as well
                  //  else {
                  // lab[x] = `V (${lab[x]})`

                  // }
                  simResultGraph.labels.push(lab[x])
                }
                // populate y_points
                for (var z = 0; z < data[i].y.length; z++) {
                  simResultGraph.y_points.push(data[i].y[z])
                }
              }

              simResultGraph.x_points = simResultGraph.x_points.map(d => parseFloat(d))

              for (let i1 = 0; i1 < simResultGraph.y_points.length; i1++) {
                simResultGraph.y_points[i1] = simResultGraph.y_points[i1].map(d => parseFloat(d))
              }
              dispatch(setResultGraph(simResultGraph))
            } else {
              var simResultText = []
              for (let i = 0; i < temp.length; i++) {
                let postfixUnit = ''
                if (temp[i][0].includes('#branch')) {
                  temp[i][0] = `I(${temp[i][0].replace('#branch', '')})`
                  postfixUnit = 'A'
                } else {
                  temp[i][0] = `V(${temp[i][0]})`
                  postfixUnit = 'V'
                }

                simResultText.push(temp[i][0] + ' ' + temp[i][1] + ' ' + parseFloat(temp[i][2]) + ' ' + postfixUnit + '\n')
              }
              // handleSimulationResult(res.data.details)
              dispatch(setResultText(simResultText))
            }
          }
        }
      })
      .then((res) => { handlesimulateOpen() })
      .catch(function (error) {
        console.log(error)
      })
  }

  return (
    <Container maxWidth="lg" className={classes.header}>
      <SimulationScreen open={simulateOpen} isResult={isResult} close={handleSimulateClose} dark={state} />
      <Grid
        container
        spacing={3}
        direction="row"
        justify="center"
        alignItems="stretch"
      >
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
