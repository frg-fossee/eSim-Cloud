import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  Divider,
  Checkbox
} from '@material-ui/core'
import { GenerateCompList } from '../SchematicEditor/Helper/ToolbarTools'

function TabPanel (props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
}

function ProjectSimulationParameters (props) {
  const [componentsList, setComponentsList] = useState([])
  const [disabled, setDisabled] = React.useState(false)

  const handleDcSweepControlLine = (evt) => {
    const value = evt.target.value

    props.setDcSweepControlLine({
      ...props.dcSweepcontrolLine,
      [evt.target.id]: value
    })
    if (props.changed === 0) {
      props.setChanged(1)
    } else if (props.changed === 2) {
      props.setChanged(3)
    }
  }
  const handleTransientAnalysisControlLineUIC = (evt) => {
    const value = evt.target.checked

    props.setTransientAnalysisControlLine({
      ...props.transientAnalysisControlLine,
      [evt.target.id]: value
    })
    if (props.changed === 0) {
      props.setChanged(1)
    } else if (props.changed === 2) {
      props.setChanged(3)
    }
  }

  const handleTransientAnalysisControlLine = (evt) => {
    const value = evt.target.value

    props.setTransientAnalysisControlLine({
      ...props.transientAnalysisControlLine,
      [evt.target.id]: value
    })
    if (props.changed === 0) {
      props.setChanged(1)
    } else if (props.changed === 2) {
      props.setChanged(3)
    }
  }
  const handleAcAnalysisControlLine = (evt) => {
    const value = evt.target.value

    props.setAcAnalysisControlLine({
      ...props.acAnalysisControlLine,
      [evt.target.id]: value
    })
    if (props.changed === 0) {
      props.setChanged(1)
    } else if (props.changed === 2) {
      props.setChanged(3)
    }
  }

  const handleTfAnalysisControlLine = (evt) => {
    const value = evt.target.value
    props.setTfAnalysisControlLine({
      ...props.tfAnalysisControlLine,
      [evt.target.id]: value
    })
    if (props.changed === 0) {
      props.setChanged(1)
    } else if (props.changed === 2) {
      props.setChanged(3)
    }
  }
  const handleTfAnalysisControlLineNodes = (evt) => {
    const value = evt.target.checked
    props.setTfAnalysisControlLine({
      ...props.tfAnalysisControlLine,
      [evt.target.id]: value
    })
    if (props.changed === 0) {
      props.setChanged(1)
    } else if (props.changed === 2) {
      props.setChanged(3)
    }
    setDisabled(props.tfAnalysisControlLine.outputNodes)
  }
  useEffect(() => {
    if (props.selectedSimulation !== '') {
      try {
        setComponentsList(['', ...GenerateCompList()])
      } catch (err) {
        setComponentsList([])
        alert('Circuit not complete. Please Check Connectons.')
      }
    }
  }, [props.selectedSimulation])
  return (
    <>
      <TabPanel value={props.selectedSimulation} index={'DC Sweep'} >
        <List style={{ color: 'black' }}>
          <h3 style={{ marginTop: '0' }}>DC Sweep</h3>
          <ListItem>
            <TextField
              style={{ width: '100%' }}
              id="parameter"
              size='small'
              variant="outlined"
              select
              label="Select Component"
              value={props.dcSweepcontrolLine.parameter}
              onChange={handleDcSweepControlLine}
              SelectProps={{
                native: true
              }}
            >
              {
                componentsList.map((value, i) => {
                  if (value.charAt(0) === 'V' || value.charAt(0) === 'v' || value.charAt(0) === 'I' || value.charAt(0) === 'i' || value === '') {
                    return (<option key={i} value={value}>
                      {value}
                    </option>)
                  } else {
                    return null
                  }
                })
              }

            </TextField>
          </ListItem>
          <ListItem>
            <TextField id="start" label="Start Voltage" size='small' variant="outlined"
              value={props.dcSweepcontrolLine.start}
              onChange={handleDcSweepControlLine}
            />
            <span style={{ marginLeft: '10px' }}>V</span>
          </ListItem>
          <ListItem>
            <TextField id="stop" label="Stop Voltage" size='small' variant="outlined"
              value={props.dcSweepcontrolLine.stop}
              onChange={handleDcSweepControlLine}
            />
            <span style={{ marginLeft: '10px' }}>V</span>
          </ListItem>
          <ListItem>
            <TextField id="step" label="Step" size='small' variant="outlined"
              value={props.dcSweepcontrolLine.step}
              onChange={handleDcSweepControlLine}
            />
            <span style={{ marginLeft: '10px' }}>V</span>
          </ListItem>

          {/* SECONDARY PARAMETER FOR SWEEP */}
          <Divider />
          <ListItem>

            <h4 style={{ marginLeft: '10px', color: 'black' }}>Secondary Parameters</h4>
          </ListItem>

          <ListItem>

            <TextField
              style={{ width: '100%' }}
              id="parameter2"
              size='small'
              variant="outlined"
              select
              label="Select Component"
              value={props.dcSweepcontrolLine.parameter2}
              onChange={handleDcSweepControlLine}
              SelectProps={{
                native: true
              }}

            >
              {
                componentsList.map((value, i) => {
                  return <option key={i} value={value}>
                    {value}
                  </option>
                })
              }
            </TextField>
          </ListItem>
          <ListItem>
            <TextField id="start2" label="Start Value" size='small' variant="outlined"
              value={props.dcSweepcontrolLine.start2}
              onChange={handleDcSweepControlLine}
            />

          </ListItem>
          <ListItem>
            <TextField id="stop2" label="Stop Value" size='small' variant="outlined"
              value={props.dcSweepcontrolLine.stop2}
              onChange={handleDcSweepControlLine}
            />

          </ListItem>
          <ListItem>
            <TextField id="step2" label="Step Value" size='small' variant="outlined"
              value={props.dcSweepcontrolLine.step2}
              onChange={handleDcSweepControlLine}
            />

          </ListItem>
        </List>
      </TabPanel>
      <TabPanel value={props.selectedSimulation} index={'Transient Analysis'} >
        <List style={{ color: 'black' }}>
          <h3 style={{ marginTop: '0' }}>Transient Analysis</h3>
          <ListItem>
            <TextField id="start" label="Start Time" size='small' variant="outlined"
              value={props.transientAnalysisControlLine.start}
              onChange={handleTransientAnalysisControlLine}
            />
            <span style={{ marginLeft: '10px' }}>S</span>
          </ListItem>
          <ListItem>
            <TextField id="stop" label="Stop Time" size='small' variant="outlined"
              value={props.transientAnalysisControlLine.stop}
              onChange={handleTransientAnalysisControlLine}
            />
            <span style={{ marginLeft: '10px' }}>S</span>
          </ListItem>
          <ListItem>
            <TextField id="step" label="Time Step" size='small' variant="outlined"
              value={props.transientAnalysisControlLine.step}
              onChange={handleTransientAnalysisControlLine}
            />
            <span style={{ marginLeft: '10px' }}>S</span>
          </ListItem>
          <ListItem>
            <Checkbox id="skipInitial" label="Use Initial Conditions" size='small' variant="outlined"
              value={props.transientAnalysisControlLine.skipInitial}
              checked={props.transientAnalysisControlLine.skipInitial}
              onChange={handleTransientAnalysisControlLineUIC}
            />
            <span style={{ marginLeft: '10px' }}>Use Initial Conditions</span>
          </ListItem>
        </List>
      </TabPanel>
      <TabPanel value={props.selectedSimulation} index={'Transfer Function Analysis'} >
        <List style={{ color: 'black' }}>
          <h3 style={{ marginTop: '0' }}>Transfer Function Analysis</h3>
          <ListItem>
            <input
              type="checkbox"
              name="Between Nodes"
              value={props.tfAnalysisControlLine.outputNodes}
              checked={props.tfAnalysisControlLine.outputNodes}
              onChange={handleTfAnalysisControlLineNodes}
              id="outputNodes"
            // checked={tfAnalysisControlLine.outputNodes}
            />
            <span style={{ marginLeft: '10px' }}>Output By Nodes</span>

          </ListItem>
          <ListItem>
            <TextField
              style={{ width: '100%' }}
              id="outputVoltageSource"
              size='small'
              variant="outlined"
              select
              label="Output Voltage SRC"
              value={props.tfAnalysisControlLine.outputVoltageSource}
              onChange={handleTfAnalysisControlLine}
              SelectProps={{
                native: true
              }}
              disabled={!disabled}
            >

              {
                componentsList.map((value, i) => {
                  if (value.charAt(0) === 'V' || value.charAt(0) === 'v' || value.charAt(0) === 'I' || value.charAt(0) === 'i' || value === '') {
                    return (<option key={i} value={value}>
                      {value}
                    </option>)
                  } else {
                    return null
                  }
                })
              }

            </TextField>

          </ListItem>
          <ListItem>
            <TextField
              style={{ width: '100%' }}
              id="inputVoltageSource"
              size='small'
              variant="outlined"
              select
              label="Input Voltage SRC"
              value={props.tfAnalysisControlLine.inputVoltageSource}
              onChange={handleTfAnalysisControlLine}
              SelectProps={{
                native: true
              }}
            >

              {
                componentsList.map((value, i) => {
                  if (value.charAt(0) === 'V' || value.charAt(0) === 'v' || value.charAt(0) === 'I' || value.charAt(0) === 'i' || value === '') {
                    return (<option key={i} value={value}>
                      {value}
                    </option>)
                  } else {
                    return null
                  }
                })
              }

            </TextField>
          </ListItem>
        </List>
      </TabPanel>
      <TabPanel value={props.selectedSimulation} index={'AC Analysis'} >
        <List style={{ color: 'black' }}>
          <h3 style={{ marginTop: '0' }}>AC Analysis</h3>
          <ListItem>
            <TextField
              style={{ width: '100%' }}
              id="input"
              size='small'
              variant="outlined"
              select
              label="Type"
              value={props.acAnalysisControlLine.input}
              onChange={handleAcAnalysisControlLine}
              SelectProps={{
                native: true
              }}

            >
              <option key="linear" value="lin">
                Linear
              </option>
              <option key="decade" value="dec">
                Decade
              </option>
              <option key="octave" value="oct">
                Octave
              </option>
            </TextField>
          </ListItem>

          <ListItem>
            <TextField id="pointsBydecade" label="Points/ Decade" size='small' variant="outlined"
              value={props.acAnalysisControlLine.pointsBydecade}
              onChange={handleAcAnalysisControlLine}
            />
          </ListItem>
          <ListItem>
            <TextField id="start" label="Start Frequency" size='small' variant="outlined"
              value={props.acAnalysisControlLine.start}
              onChange={handleAcAnalysisControlLine}
            />
            <span style={{ marginLeft: '10px' }}>Hz</span>
          </ListItem>
          <ListItem>
            <TextField id="stop" label="Stop Frequency" size='small' variant="outlined"
              value={props.acAnalysisControlLine.stop}
              onChange={handleAcAnalysisControlLine}
            />
            <span style={{ marginLeft: '10px' }}>Hz</span>
          </ListItem>
        </List>
      </TabPanel>
    </>
  )
}

ProjectSimulationParameters.propTypes = {
  dcSweepcontrolLine: PropTypes.object,
  transientAnalysisControlLine: PropTypes.object,
  acAnalysisControlLine: PropTypes.object,
  tfAnalysisControlLine: PropTypes.object,
  setDcSweepControlLine: PropTypes.func,
  setTransientAnalysisControlLine: PropTypes.func,
  setAcAnalysisControlLine: PropTypes.func,
  setTfAnalysisControlLine: PropTypes.func,
  setChanged: PropTypes.func,
  selectedSimulation: PropTypes.string,
  changed: PropTypes.bool
}
export default ProjectSimulationParameters
