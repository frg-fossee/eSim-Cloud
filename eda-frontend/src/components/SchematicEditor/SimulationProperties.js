/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import {
  List,
  Checkbox,
  ListItem,
  Button,
  TextField,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector, useDispatch } from 'react-redux'
import { setControlLine, setControlBlock } from '../../redux/actions/netlistActions'
import { GenerateNetList } from './Helper/ToolbarTools'
import SimulationScreen from './SimulationScreen'
import api from '../../utils/Api'

const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: '90px'
  },
  pages: {
    margin: theme.spacing(0, 1)
  },
  propertiesBox: {
    width: '100%'
  },
  simulationOptions: {
    margin: '0px',
    padding: '0px',
    width: '100%'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  }
}))

export default function SimulationProperties () {
  const netfile = useSelector(state => state.netlistReducer)
  const dispatch = useDispatch()
  const classes = useStyles()
  const [dcSweepcontrolLine, setDcSweepControlLine] = useState({
    parameter: '',
    sweepType: 'Linear',
    start: '0',
    stop: '',
    step: ''
  })
  const [transientAnalysisControlLine, setTransientAnalysisControlLine] = useState({
    start: '0',
    stop: '',
    step: '',
    skipInitial: 'No'
  })

  const [acAnalysisControlLine, setAcAnalysisControlLine] = useState({
    input: '',
    start: '',
    stop: '',
    pointsBydecade: ''
  })

  const handleDcSweepControlLine = (evt) => {
    const value = evt.target.value

    setDcSweepControlLine({
      ...dcSweepcontrolLine,
      [evt.target.id]: value
    })
  }

  const handleTransientAnalysisControlLine = (evt) => {
    const value = evt.target.value

    setTransientAnalysisControlLine({
      ...transientAnalysisControlLine,
      [evt.target.id]: value
    })
  }

  const handleAcAnalysisControlLine = (evt) => {
    const value = evt.target.value

    setAcAnalysisControlLine({
      ...acAnalysisControlLine,
      [evt.target.id]: value
    })
  }

  const [simulateOpen, setSimulateOpen] = React.useState(false)

  const handlesimulateOpen = () => {
    setSimulateOpen(true)
  }

  const handleSimulateClose = () => {
    setSimulateOpen(false)
  }

  const [simResult, setsimResult] = useState({})
  // Prepare Netlist to file
  const prepareNetlist = (netlist) => {
    var titleA = netfile.title.split(' ')[1]
    var myblob = new Blob([netlist], {
      type: 'text/plain'
    })
    var file = new File([myblob], `${titleA}.cir`, { type: 'text/plain', lastModified: Date.now() })
    // console.log(file)
    sendNetlist(file)
  }

  function sendNetlist (file) {
    netlistConfig(file)
      .then((response) => {
        const res = response.data
        const getUrl = 'simulation/status/'.concat(res.details.task_id)
        console.log(getUrl)
        simulationResult(getUrl)
      })
      .catch(function (error) {
        console.log(error)
      })
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

  // Get the simulation result with task_Id
  function simulationResult (url) {
    api
      .get(url)
      .then((res) => {
        if (res.data.state === 'PROGRESS' || res.data.state === 'PENDING') {
          setTimeout(simulationResult(url), 1000)
        } else {
          console.log(res.data)
          var simresult = {}
          simresult.x1 = res.data.details.data[0].x
          simresult.y11 = res.data.details.data[0].y[0]
          simresult.y21 = res.data.details.data[0].y[1]
          console.log(simresult)
          setsimResult(simresult)
          handlesimulateOpen()
        }
      })
      .then((res) => { })
      .catch(function (error) {
        console.log(error)
      })
  }

  const startSimulate = (type) => {
    var compNetlist = GenerateNetList()
    var controlLine = ''
    var controlBlock = ''
    switch (type) {
      case 'DcSolver':
        // console.log('To be implemented')
        controlLine = '.op'
        break
      case 'DcSweep':
        // console.log(dcSweepcontrolLine)
        controlLine = `.dc ${dcSweepcontrolLine.parameter} ${dcSweepcontrolLine.start} ${dcSweepcontrolLine.stop} ${dcSweepcontrolLine.step}`
        break
      case 'Transient':
        // console.log(transientAnalysisControlLine)
        controlLine = `.tran ${transientAnalysisControlLine.step}e-03 ${transientAnalysisControlLine.stop}e-03 ${transientAnalysisControlLine.start}e-03`
        break
      case 'Ac':
        // console.log(acAnalysisControlLine)
        controlLine = `.ac dec ${acAnalysisControlLine.pointsBydecade} ${acAnalysisControlLine.start} ${acAnalysisControlLine.stop}`
        break
      default:
        break
    }
    controlBlock = '\n.control \nrun \nprint all > data.txt \n.endc \n.end'
    // console.log(controlLine)

    dispatch(setControlLine(controlLine))
    dispatch(setControlBlock(controlBlock))
    // setTimeout(function () { }, 2000)

    var netlist = netfile.title + '\n' +
      netfile.model + '\n' +
      compNetlist + '\n' +
      controlLine + '\n' +
      controlBlock + '\n'

    prepareNetlist(netlist)

    // handlesimulateOpen()
  }

  return (
    <>
      <div className={classes.SimulationOptions}>
        <SimulationScreen open={simulateOpen} close={handleSimulateClose} simResult={simResult}/>

        {/* Simulation modes list */}
        <List>

          {/* DC Solver */}
          <ListItem className={classes.simulationOptions} divider>
            <div className={classes.propertiesBox}>
              <ExpansionPanel>
                <ExpansionPanelSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.heading}>DC Solver</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <form>
                    <List>
                      <ListItem>
                        <Button size='small' variant="contained" color="primary"
                          onClick={(e) => { startSimulate('DcSolver') }}>
                          Run dc solver
                        </Button>
                      </ListItem>
                    </List>
                  </form>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
          </ListItem>

          {/* DC Sweep */}
          <ListItem className={classes.simulationOptions} divider>
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography className={classes.heading}>DC Sweep</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <form className={classes.propertiesBox} noValidate autoComplete="off">
                  <List>
                    <ListItem>
                      <TextField size='small' variant="outlined" id="parameter" label="Parameter"
                        value={dcSweepcontrolLine.parameter}
                        onChange={handleDcSweepControlLine}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        style={{ width: '100%' }}
                        id="sweepType"
                        size='small'
                        variant="outlined"
                        select
                        label="Sweep Type"
                        value={dcSweepcontrolLine.sweepType}
                        onChange={handleDcSweepControlLine}
                        SelectProps={{
                          native: true
                        }}

                      >
                        <option key="linear" value="linear">
                          Linear
                        </option>
                        <option key="decade" value="decade">
                          Decade
                        </option>
                      </TextField>
                    </ListItem>
                    <ListItem>
                      <TextField id="start" label="Start" size='small' variant="outlined"
                        value={dcSweepcontrolLine.start}
                        onChange={handleDcSweepControlLine}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField id="stop" label="Stop" size='small' variant="outlined"
                        value={dcSweepcontrolLine.stop}
                        onChange={handleDcSweepControlLine}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField id="step" label="Step" size='small' variant="outlined"
                        value={dcSweepcontrolLine.step}
                        onChange={handleDcSweepControlLine}
                      />
                    </ListItem>
                    <ListItem>
                      Second Parameter:
                      <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />
                    </ListItem>
                    <ListItem>
                      <Button size='small' variant="contained">Add Expression</Button>
                    </ListItem>
                    <ListItem>
                      <Button id="dcSweepSimulate" size='small' variant="contained" color="primary" onClick={(e) => { startSimulate('DcSweep') }}>
                        Simulate
                      </Button>
                    </ListItem>
                  </List>
                </form>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </ListItem>

          {/* Transient Analysis */}
          <ListItem className={classes.simulationOptions} divider>
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography className={classes.heading}>Transient Analysis</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <form className={classes.propertiesBox} noValidate autoComplete="off">
                  <List>
                    <ListItem>
                      <TextField id="start" label="Start Time" size='small' variant="outlined"
                        value={transientAnalysisControlLine.start}
                        onChange={handleTransientAnalysisControlLine}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField id="stop" label="Stop Time" size='small' variant="outlined"
                        value={transientAnalysisControlLine.stop}
                        onChange={handleTransientAnalysisControlLine}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField id="step" label="Time Step" size='small' variant="outlined"
                        value={transientAnalysisControlLine.step}
                        onChange={handleTransientAnalysisControlLine}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        style={{ width: '100%' }}
                        id="skipInitial"
                        size='small'
                        variant="outlined"
                        select
                        label="Skip Initial"
                        value={transientAnalysisControlLine.skipInitial}
                        onChange={handleTransientAnalysisControlLine}
                        SelectProps={{
                          native: true
                        }}

                      >
                        <option key="No" value="No">
                          No
                        </option>
                        <option key="Yes" value="Yes">
                          Yes
                        </option>
                      </TextField>
                    </ListItem>
                    <ListItem>
                      Sweep Parameter:
                      <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />
                    </ListItem>
                    <ListItem>
                      <Button size='small' variant="contained">Add Expression</Button>
                    </ListItem>
                    <ListItem>
                      <Button id="transientAnalysisSimulate" size='small' variant="contained" color="primary" onClick={(e) => { startSimulate('Transient') }}>
                        Simulate
                      </Button>
                    </ListItem>
                  </List>
                </form>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </ListItem>

          {/* AC Analysis */}
          <ListItem className={classes.simulationOptions} divider>
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography className={classes.heading}>AC Analysis</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <form className={classes.propertiesBox} noValidate autoComplete="off">
                  <List>
                    <ListItem>
                      <TextField id="input" label="Input" size='small' variant="outlined"
                        value={acAnalysisControlLine.skipInitial}
                        onChange={handleAcAnalysisControlLine}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField id="start" label="Start" size='small' variant="outlined"
                        value={acAnalysisControlLine.skipInitial}
                        onChange={handleAcAnalysisControlLine}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField id="stop" label="Stop" size='small' variant="outlined"
                        value={acAnalysisControlLine.skipInitial}
                        onChange={handleAcAnalysisControlLine}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField id="pointsBydecade" label="Points/ Decade" size='small' variant="outlined"
                        value={acAnalysisControlLine.skipInitial}
                        onChange={handleAcAnalysisControlLine}
                      />
                    </ListItem>
                    <ListItem>
                      Sweep Parameter:
                      <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />
                    </ListItem>
                    <ListItem>
                      <Button size='small' variant="contained">Add Expression</Button>
                    </ListItem>
                    <ListItem>
                      <Button size='small' variant="contained" color="primary" onClick={(e) => { startSimulate('Ac') }}>
                        Simulate
                      </Button>
                    </ListItem>
                  </List>
                </form>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </ListItem>
        </List>
      </div>
    </>
  )
}
