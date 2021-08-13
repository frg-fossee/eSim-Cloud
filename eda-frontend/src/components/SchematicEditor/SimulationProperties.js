/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  List,
  Checkbox,
  ListItem,
  Button,
  TextField,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
  Divider,
  Popover,
  Tooltip,
  Snackbar,
  IconButton
} from '@material-ui/core'
import queryString from 'query-string'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import MuiAlert from '@material-ui/lab/Alert'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector, useDispatch } from 'react-redux'
import { setControlLine, setControlBlock, setResultTitle, setResultGraph, setResultText, setNetlist } from '../../redux/actions/index'
import { GenerateNetList, GenerateNodeList, GenerateCompList, ErcCheckNets } from './Helper/ToolbarTools'
import SimulationScreen from '../Shared/SimulationScreen'
import { Multiselect } from 'multiselect-react-dropdown'
import Notice from '../Shared/Notice'
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

function Alert (props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}
export default function SimulationProperties (props) {
  const netfile = useSelector(state => state.netlistReducer)
  const isSimRes = useSelector(state => state.simulationReducer.isSimRes)
  const [taskId, setTaskId] = useState(null)
  const dispatch = useDispatch()
  const classes = useStyles()
  const [nodeList, setNodeList] = useState([])
  const [componentsList, setComponentsList] = useState([])
  const [errMsg, setErrMsg] = useState('')
  const [err, setErr] = useState(false)
  const [error, setError] = useState(false)
  const [warning, setWarning] = useState(false)
  const [needParameters, setNeedParameters] = useState(false)
  const [status, setStatus] = useState('')
  const stats = { loading: 'loading', error: 'error', success: 'success' }
  const [dcSweepcontrolLine, setDcSweepControlLine] = useState(props.dcSweepcontrolLine ? props.dcSweepcontrolLine : {
    parameter: '',
    sweepType: 'Linear',
    start: '',
    stop: '',
    step: '',
    parameter2: '',
    start2: '',
    stop2: '',
    step2: ''
  })
  const [transientAnalysisControlLine, setTransientAnalysisControlLine] = useState(props.transientAnalysisControlLine ? props.transientAnalysisControlLine : {
    start: '0',
    stop: '',
    step: '',
    skipInitial: false
  })

  const [acAnalysisControlLine, setAcAnalysisControlLine] = useState(props.acAnalysisControlLine ? props.acAnalysisControlLine : {
    input: 'dec',
    start: '',
    stop: '',
    pointsBydecade: ''
  })

  const [tfAnalysisControlLine, setTfAnalysisControlLine] = useState(props.tfAnalysisControlLine ? props.tfAnalysisControlLine : {
    outputNodes: false,
    outputVoltageSource: '',
    inputVoltageSource: ''
  })

  const [NoiseAnalysisControlLine, setNoiseAnalysisControlLine] = useState(props.NoiseAnalysisControlLine ? props.NoiseAnalysisControlLine : {
    inputVoltageSource: '',
    input: 'dec',
    start: '',
    stop: '',
    pointsBydecade: '',
    outputSpectrum: false
  })

  const [controlBlockParam, setControlBlockParam] = useState('')
  const [simType, setSimType] = React.useState('')
  let typeSimulation = ''

  const handleControlBlockParam = (evt) => {
    setControlBlockParam(evt.target.value)
  }
  const analysisNodeArray = []
  const analysisCompArray = []
  const nodeArray = []
  const nodeNoiseArray = []
  // const pushZero = (nodeArray) => {
  //   nodeArray.push({ key: 0 })
  // }

  const onTabExpand = () => {
    try {
      setComponentsList(['', ...GenerateCompList()])
      setNodeList(['', ...GenerateNodeList()])
    } catch (err) {
      setComponentsList([])
      setNodeList([])
      setWarning(true)
    }
  }

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
  const handleTransientAnalysisControlLineUIC = (evt) => {
    const value = evt.target.checked

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

  const handleTfAnalysisControlLine = (evt) => {
    const value = evt.target.value
    setTfAnalysisControlLine({
      ...tfAnalysisControlLine,
      [evt.target.id]: value
    })
  }
  const handleTfAnalysisControlLineNodes = (evt) => {
    const value = evt.target.checked
    setTfAnalysisControlLine({
      ...tfAnalysisControlLine,
      [evt.target.id]: value
    })
  }
  const handleNoiseAnalysisControlLine = (evt) => {
    const value = evt.target.value
    setNoiseAnalysisControlLine({
      ...NoiseAnalysisControlLine,
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
  const [simResult, setSimResult] = React.useState({})

  const handleSimulationResult = (simResults) => {
    setSimResult(simResults)
  }

  const acTypeOptionList = {
    Linear: 'lin',
    Decade: 'dec',
    Octave: 'oct'
  }
  const [selectedValue, setSelectedValue] = React.useState([])
  const [selectedValueDCSweep, setSelectedValueDCSweep] = React.useState([])
  const [selectedValueTransientAnal, setSelectedValueTransientAnal] = React.useState([])
  const [selectedValueTFAnal, setSelectedValueTFAnal] = React.useState([])
  const [selectedValueNoiseAnal, setSelectedValueNoiseAnal] = React.useState([])
  const [selectedValueComp, setSelectedValueComp] = React.useState([])
  const [selectedValueDCSweepComp, setSelectedValueDCSweepComp] = React.useState([])
  const [selectedValueTransientAnalComp, setSelectedValueTransientAnalComp] = React.useState([])
  const [selectedgraphNoiseComp, setSelectedgraphNoiseComp] = React.useState([])

  const handleAddSelectedValueDCSweep = (data) => {
    let f = 0
    selectedValueDCSweep.forEach((value, i) => {
      if (value[i] !== undefined) {
        if (value[i].key === data) f = 1
      }
    })
    if (f === 0) {
      const tmp = [...selectedValueDCSweep, data]
      setSelectedValueDCSweep(tmp)
    }
    // console.log(selectedValue)
  }
  const handleRemSelectedValueDCSweep = (data) => {
    const tmp = []
    selectedValueDCSweep.forEach((value, i) => {
      if (value[i] !== undefined) {
        if (value[i].key !== data) tmp.push(data)
      }
    })
    setSelectedValueDCSweep(tmp)
    // console.log(selectedValue)
  }
  const handleAddSelectedValueTransientAnal = (data) => {
    let f = 0
    selectedValueTransientAnal.forEach((value, i) => {
      if (value[i] !== undefined) {
        if (value[i].key === data) f = 1
      }
    })
    if (f === 0) {
      const tmp = [...selectedValueTransientAnal, data]
      setSelectedValueTransientAnal(tmp)
    }
    // console.log(selectedValue)
  }
  const handleRemSelectedValueTransientAnal = (data) => {
    const tmp = []
    selectedValueTransientAnal.forEach((value, i) => {
      if (value[i] !== undefined) {
        if (value[i].key !== data) tmp.push(data)
      }
    })
    setSelectedValueTransientAnal(tmp)
    // console.log(selectedValue)
  }
  const handleAddSelectedValueTFAnal = (data) => {
    let f = 0
    selectedValueTFAnal.forEach((value, i) => {
      if (value[i] !== undefined) {
        if (value[i].key === data) f = 1
      }
    })
    if (f === 0) {
      const tmp = [...selectedValueTFAnal, data]
      setSelectedValueTFAnal(tmp)
    }
    // console.log(selectedValue)
  }
  const handleRemSelectedValueTFAnal = (data) => {
    const tmp = []
    selectedValueTFAnal.forEach((value, i) => {
      if (value[i] !== undefined) {
        if (value[i].key !== data) tmp.push(data)
      }
    })
    setSelectedValueTFAnal(tmp)
    // console.log(selectedValue)
  }
  const handleAddSelectedValueNoiseAnal = (data) => {
    let f = 0
    selectedValueNoiseAnal.forEach((value, i) => {
      if (value[i] !== undefined) {
        if (value[i].key === data) f = 1
      }
    })
    if (f === 0) {
      const tmp = data
      setSelectedValueNoiseAnal(tmp)
    }
  }
  const handleRemSelectedValueNoiseAnal = (data) => {
    setSelectedValueNoiseAnal(data)
  }
  const handleAddSelectedValueDCSweepComp = (data) => {
    let f = 0
    selectedValueDCSweepComp.forEach((value, i) => {
      if (value[i] !== undefined) {
        if (value[i].key === data) f = 1
      }
    })
    if (f === 0) {
      const tmp = [...selectedValueDCSweepComp, data]
      setSelectedValueDCSweepComp(tmp)
    }
    // console.log(selectedValue)
  }
  const handleRemSelectedValueDCSweepComp = (data) => {
    const tmp = []
    selectedValueDCSweepComp.forEach((value, i) => {
      if (value[i] !== undefined) {
        if (value[i].key !== data) tmp.push(data)
      }
    })
    setSelectedValueDCSweepComp(tmp)
    // console.log(selectedValue)
  }
  const handleAddSelectedValueTransientAnalComp = (data) => {
    let f = 0
    selectedValueTransientAnalComp.forEach((value, i) => {
      if (value[i] !== undefined) {
        if (value[i].key === data) f = 1
      }
    })
    if (f === 0) {
      const tmp = [...selectedValueTransientAnalComp, data]
      setSelectedValueTransientAnalComp(tmp)
    }
    // console.log(selectedValue)
  }
  const handleRemSelectedValueTransientAnalComp = (data) => {
    const tmp = []
    selectedValueTransientAnalComp.forEach((value, i) => {
      if (value[i] !== undefined) {
        if (value[i].key !== data) tmp.push(data)
      }
    })
    setSelectedValueTransientAnalComp(tmp)
    // console.log(selectedValue)
  }
  const handleNoiseOutputMode = (evt) => {
    const value = evt.target.checked
    setNoiseAnalysisControlLine({
      ...NoiseAnalysisControlLine,
      [evt.target.id]: value
    })
  }
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
  // Prepare Netlist to file
  const prepareNetlist = (netlist) => {
    const titleA = netfile.title.split(' ')[1]
    const myblob = new Blob([netlist], {
      type: 'text/plain'
    })
    const file = new File([myblob], `${titleA}.cir`, { type: 'text/plain', lastModified: Date.now() })
    // console.log(file)
    sendNetlist(file)
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

  // Upload the nelist
  function netlistConfig (file) {
    const token = localStorage.getItem('esim_token')
    const url = queryString.parse(window.location.href.split('editor?')[1])
    const formData = new FormData()
    formData.append('simulationType', typeSimulation)
    formData.append('file', file)
    if (url.id) {
      formData.append('save_id', url.id)
      formData.append('version', url.version)
      formData.append('branch', url.branch)
    }
    if (url.lti_nonce) {
      formData.append('lti_id', url.lti_id)
    }
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    setSimType(typeSimulation)
    return api.post('simulation/upload', formData, config)
  }

  const [isResult, setIsResult] = useState(false)

  // Get the simulation result with task_Id
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
            // console.log('DATA SIm', data)
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

              handleSimulationResult(res.data.details)
              dispatch(setResultText(simResultText))
            }
            setIsResult(true)
            props.setLtiSimResult(true)
          }
        }
      })
      .then((res) => {
        if (isError === false && resPending === false) {
          console.log('no error')
          handleStatus(stats.success)
          handlesimulateOpen()
        } else if (resPending === false) {
          handleStatus(stats.error)
          handleErrMsg(msg)
        }
        handleErrOpen()
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  const startSimulate = (type) => {
    if (ErcCheckNets() && componentsList !== [] && nodeList !== []) {
      let compNetlist
      try {
        compNetlist = GenerateNetList()
      } catch {
        setError(true)
        return
      }
      let controlLine = ''
      let controlBlock = ''
      let skipMultiNodeChk = 0
      let nodes = ''
      let uic = ''
      let noiseMode = ''
      switch (type) {
        case 'DcSolver':
          // console.log('To be implemented')
          typeSimulation = 'DcSolver'
          controlLine = '.op'

          dispatch(setResultTitle('DC Solver Output'))
          break
        case 'DcSweep':
          // console.log(dcSweepcontrolLine)
          if (dcSweepcontrolLine.parameter !== '' && dcSweepcontrolLine.start !== '' && dcSweepcontrolLine.stop !== '' && dcSweepcontrolLine.step !== '') {
            typeSimulation = 'DcSweep'
            controlLine = `.dc ${dcSweepcontrolLine.parameter} ${dcSweepcontrolLine.start} ${dcSweepcontrolLine.stop} ${dcSweepcontrolLine.step} ${dcSweepcontrolLine.parameter2} ${dcSweepcontrolLine.start2} ${dcSweepcontrolLine.stop2} ${dcSweepcontrolLine.step2}`
            dispatch(setResultTitle('DC Sweep Output'))
            setSelectedValue(selectedValueDCSweep)
            setSelectedValueComp(selectedValueDCSweepComp)
          } else {
            setNeedParameters(true)
            return
          }
          break
        case 'Transient':
          // console.log(transientAnalysisControlLine)
          if (transientAnalysisControlLine.step !== '' && transientAnalysisControlLine.start !== '' && transientAnalysisControlLine.start !== '') {
            typeSimulation = 'Transient'
            if (transientAnalysisControlLine.skipInitial === true) uic = 'UIC'
            controlLine = `.tran ${transientAnalysisControlLine.step} ${transientAnalysisControlLine.stop} ${transientAnalysisControlLine.start} ${uic}`
            dispatch(setResultTitle('Transient Analysis Output'))
            setSelectedValue(selectedValueTransientAnal)
            setSelectedValueComp(selectedValueTransientAnalComp)
          } else {
            setNeedParameters(true)
            return
          }
          break
        case 'Ac':
          // console.log(acAnalysisControlLine)
          if (acAnalysisControlLine.input !== '' && acAnalysisControlLine.pointsBydecade !== '' && acAnalysisControlLine.start !== '' && acAnalysisControlLine.stop !== '') {
            typeSimulation = 'Ac'
            controlLine = `.ac ${acAnalysisControlLine.input} ${acAnalysisControlLine.pointsBydecade} ${acAnalysisControlLine.start} ${acAnalysisControlLine.stop}`
            dispatch(setResultTitle('AC Analysis Output'))
          } else {
            setNeedParameters(true)
            return
          }
          break
        case 'tfAnalysis':
          if (tfAnalysisControlLine.inputVoltageSource !== '') {
            typeSimulation = 'tfAnalysis'
            setSelectedValue(selectedValueTFAnal)
            if (tfAnalysisControlLine.outputNodes === true) {
              selectedValue.forEach((value, i) => {
                if (value[i] !== undefined) {
                  nodes = nodes + ' ' + String(value[i].key)
                }
              })
              nodes = 'V(' + nodes + ')'
            } else {
              nodes = `I(${tfAnalysisControlLine.outputVoltageSource})`
            }
            console.log(tfAnalysisControlLine.outputNodes)
            controlLine = `.tf ${nodes} ${tfAnalysisControlLine.inputVoltageSource}`

            dispatch(setResultTitle('Transfer Function Analysis Output'))
            skipMultiNodeChk = 1
          } else {
            setNeedParameters(true)
            return
          }
          break
        case 'noiseAnalysis':
          // console.log('Start noise analysis simulation', selectedValueNoiseAnal, NoiseAnalysisControlLine)
          typeSimulation = 'noiseAnalysis'
          var node1 = selectedValueNoiseAnal[0].key
          var node2 = '0'
          if (selectedValueNoiseAnal.length > 1) {
            node2 = selectedValueNoiseAnal[1].key
          }
          if (NoiseAnalysisControlLine.inputVoltageSource && NoiseAnalysisControlLine.pointsBydecade && NoiseAnalysisControlLine.input && NoiseAnalysisControlLine.start && NoiseAnalysisControlLine.stop) {
            controlLine = `.noise v(${node1}, ${node2}) ${NoiseAnalysisControlLine.inputVoltageSource} ${NoiseAnalysisControlLine.input} ${NoiseAnalysisControlLine.pointsBydecade} ${NoiseAnalysisControlLine.start} ${NoiseAnalysisControlLine.stop}`
            noiseMode = NoiseAnalysisControlLine.outputSpectrum ? 'setplot noise1' : 'setplot noise2'
            dispatch(setResultTitle('Noise Analysis Output'))
          } else {
            setNeedParameters(true)
            return
          }
          break
        default:
          break
      }
      // console.log(selectedValue)
      let atleastOne = 0
      let cblockline = ''
      // if either the extra expression field or the nodes multi select
      // drop down list in enabled then atleast one value is made non zero
      // to add add all instead to the print statement.
      if (selectedValue.length > 0 && selectedValue !== null && skipMultiNodeChk === 0) {
        selectedValue.forEach((value, i) => {
          if (value[i] !== undefined && value[i].key !== 0) {
            atleastOne = 1
            cblockline = cblockline + ' ' + String(value[i].key)
          }
        })
      }
      if (selectedValueComp.length > 0 && selectedValueComp !== null) {
        selectedValueComp.forEach((value, i) => {
          if (value[i] !== undefined && value[i].key !== 0) {
            atleastOne = 1
            if (value[i].key.charAt(0) === 'V' || value[i].key.charAt(0) === 'v') {
              cblockline = cblockline + ' I(' + String(value[i].key) + ') '
            }
          }
        })
      }
      if (controlBlockParam.length > 0) {
        cblockline = cblockline + ' ' + controlBlockParam
        atleastOne = 1
      }

      if (atleastOne === 0) cblockline = 'all'
      if (typeSimulation !== 'noiseAnalysis') {
        controlBlock = `\n.control \nrun \nprint ${cblockline} > data.txt \n.endc \n.end`
      } else {
        controlBlock = `\n.control \nrun \n${noiseMode} \nprint ${cblockline} > data.txt \n.endc \n.end`
      }
      // console.log(controlLine)

      dispatch(setControlLine(controlLine))
      dispatch(setControlBlock(controlBlock))
      // setTimeout(function () { }, 2000)

      const netlist = netfile.title + '\n\n' +
        compNetlist.models + '\n' +
        compNetlist.main + '\n' +
        controlLine + '\n' +
        controlBlock + '\n'

      dispatch(setNetlist(netlist))
      prepareNetlist(netlist)
    }

    // handlesimulateOpen()
  }

  // simulation properties add expression input box
  const [anchorEl, setAnchorEl] = React.useState(null)
  const handleAddExpressionClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleAddExpressionClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <>
      <div className={classes.SimulationOptions}>
        <Snackbar
          open={needParameters}
          autoHideDuration={6000}
          onClose={() => setNeedParameters(false)}
        >
          <Alert onClose={() => setNeedParameters(false)} severity="error">
            Please enter the necessary parameters!
          </Alert>
        </Snackbar>
        <Snackbar
          open={warning}
          autoHideDuration={6000}
          onClose={() => setWarning(false)}
        >
          <Alert onClose={() => setWarning(false)} severity="warning">
            Circuit is not complete to be simulated!
          </Alert>
        </Snackbar>
        <Snackbar
          open={error}
          autoHideDuration={6000}
          onClose={() => setError(false)}
        >
          <Alert onClose={() => setError(false)} severity="error">
            Cannot simulate an incomplete circuit!
          </Alert>
        </Snackbar>
        <SimulationScreen open={simulateOpen} isResult={isResult} close={handleSimulateClose} taskId={taskId} simType={simType} />
        <Notice status={status} open={err} msg={errMsg} close={handleErrClose} />
        {/* Simulation modes list */}
        <List>
          {/* DC Solver */}
          <ListItem className={classes.simulationOptions} divider>
            <div className={classes.propertiesBox}>
              <ExpansionPanel onClick={onTabExpand}>
                <ExpansionPanelSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  style={{ width: '100%  ' }}
                >
                  <Typography className={classes.heading}>DC Solver</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <form>
                    <List>
                      <ListItem>

                        <Button aria-describedby={id} variant="outlined" color="primary" size="small" onClick={handleAddExpressionClick}>
                          Add Expression
                        </Button>
                        <Tooltip title={'Add expression seperated by spaces.\n Include #branch at end of expression to indicate current  e.g v1#branch. To add multiple expression seperate them by spaces eg. v1 v2 v3#branch'}>
                          <IconButton aria-label="info">
                            <InfoOutlinedIcon style={{ fontSize: 'large' }} />
                          </IconButton>
                        </Tooltip>
                        <Popover
                          id={id}
                          open={open}
                          anchorEl={anchorEl}
                          onClose={handleAddExpressionClose}

                          anchorOrigin={{
                            vertical: 'center',
                            horizontal: 'left'
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left'
                          }}
                        >

                          <TextField id="controlBlockParam" placeHolder="enter expression" size='large' variant="outlined"
                            value={controlBlockParam}
                            onChange={handleControlBlockParam}
                          />
                        </Popover>
                      </ListItem>
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
            <ExpansionPanel onClick={onTabExpand}>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                style={{ width: '97%' }}
              >
                <Typography className={classes.heading}>DC Sweep</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <form className={classes.propertiesBox} noValidate autoComplete="off">
                  <List>
                    <ListItem>
                      <TextField
                        style={{ width: '100%' }}
                        id="parameter"
                        size='small'
                        variant="outlined"
                        select
                        label="Select Component"
                        value={dcSweepcontrolLine.parameter}
                        error={!dcSweepcontrolLine.parameter}
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
                        value={dcSweepcontrolLine.start}
                        error={!dcSweepcontrolLine.start}
                        onChange={handleDcSweepControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>V</span>
                    </ListItem>
                    <ListItem>
                      <TextField id="stop" label="Stop Voltage" size='small' variant="outlined"
                        value={dcSweepcontrolLine.stop}
                        error={!dcSweepcontrolLine.stop}
                        onChange={handleDcSweepControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>V</span>
                    </ListItem>
                    <ListItem>
                      <TextField id="step" label="Step" size='small' variant="outlined"
                        value={dcSweepcontrolLine.step}
                        error={!dcSweepcontrolLine.step}
                        onChange={handleDcSweepControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>V</span>
                    </ListItem>

                    {/* SECONDARY PARAMETER FOR SWEEP */}
                    <Divider />
                    <ListItem>

                      <h4 style={{ marginLeft: '10px' }}>Secondary Parameters</h4>
                    </ListItem>

                    <ListItem>

                      <TextField
                        style={{ width: '100%' }}
                        id="parameter2"
                        size='small'
                        variant="outlined"
                        select
                        label="Select Component"
                        value={dcSweepcontrolLine.parameter2}
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
                        value={dcSweepcontrolLine.start2}
                        onChange={handleDcSweepControlLine}
                      />

                    </ListItem>
                    <ListItem>
                      <TextField id="stop2" label="Stop Value" size='small' variant="outlined"
                        value={dcSweepcontrolLine.stop2}
                        onChange={handleDcSweepControlLine}
                      />

                    </ListItem>
                    <ListItem>
                      <TextField id="step2" label="Step Value" size='small' variant="outlined"
                        value={dcSweepcontrolLine.step2}
                        onChange={handleDcSweepControlLine}
                      />

                    </ListItem>
                    <ListItem>
                      <Multiselect
                        style={{ width: '100%' }}
                        id="Nodes"
                        closeOnSelect="false"
                        placeholder="Select Node"
                        onSelect={handleAddSelectedValueDCSweep}
                        onRemove={handleRemSelectedValueDCSweep}
                        options={analysisNodeArray} displayValue="key"
                        avoidHighlightFirstOption="true"
                      />
                    </ListItem>
                    <ListItem>
                      <Multiselect
                        style={{ width: '100%' }}
                        id="Branch"
                        closeOnSelect="false"
                        placeholder="Select VSRC"
                        onSelect={handleAddSelectedValueDCSweepComp}
                        onRemove={handleRemSelectedValueDCSweepComp}
                        options={analysisCompArray} displayValue="key"
                        avoidHighlightFirstOption="true"
                      />
                    </ListItem>
                    <ListItem>

                      <Button aria-describedby={id} variant="outlined" color="primary" size="small" onClick={handleAddExpressionClick}>
                        Add Expression
                      </Button>
                      <Tooltip title={'Add expression seperated by spaces.\n Include #branch at end of expression to indicate current  e.g v1#branch. To add multiple expression seperate them by spaces eg. v1 v2 v3#branch'}>
                        <IconButton aria-label="info">
                          <InfoOutlinedIcon style={{ fontSize: 'large' }} />
                        </IconButton>
                      </Tooltip>
                      <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleAddExpressionClose}

                        anchorOrigin={{
                          vertical: 'center',
                          horizontal: 'left'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left'
                        }}
                      >

                        <TextField id="controlBlockParam" placeHolder="enter expression" size='large' variant="outlined"
                          value={controlBlockParam}
                          onChange={handleControlBlockParam}
                        />

                      </Popover>

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
            <ExpansionPanel onClick={onTabExpand}>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                style={{ width: '97%' }}
              >
                <Typography className={classes.heading}>Transient Analysis</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <form className={classes.propertiesBox} noValidate autoComplete="off">
                  <List>
                    <ListItem>
                      <TextField id="start" label="Start Time" size='small' variant="outlined"
                        value={transientAnalysisControlLine.start}
                        error={!transientAnalysisControlLine.start}
                        onChange={handleTransientAnalysisControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>S</span>
                    </ListItem>
                    <ListItem>
                      <TextField id="stop" label="Stop Time" size='small' variant="outlined"
                        value={transientAnalysisControlLine.stop}
                        error={!transientAnalysisControlLine.stop}
                        onChange={handleTransientAnalysisControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>S</span>
                    </ListItem>
                    <ListItem>
                      <TextField id="step" label="Time Step" size='small' variant="outlined"
                        value={transientAnalysisControlLine.step}
                        error={!transientAnalysisControlLine.step}
                        onChange={handleTransientAnalysisControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>S</span>
                    </ListItem>
                    <ListItem>
                      <Checkbox id="skipInitial" label="Use Initial Conditions" size='small' variant="outlined"
                        value={transientAnalysisControlLine.skipInitial}
                        checked={transientAnalysisControlLine.skipInitial}
                        onChange={handleTransientAnalysisControlLineUIC}
                      />
                      <span style={{ marginLeft: '10px' }}>Use Initial Conditions</span>
                    </ListItem>
                    <ListItem>
                      {nodeList.forEach((value) => {
                        if (value !== null && value !== '') {
                          analysisNodeArray.push({ key: value })
                        }
                      })
                      }

                      <Multiselect
                        style={{ width: '100%' }}
                        id="Nodes"
                        closeOnSelect="false"
                        placeholder="Select Node"
                        onSelect={handleAddSelectedValueTransientAnal}
                        onRemove={handleRemSelectedValueTransientAnal}
                        options={analysisNodeArray} displayValue="key"
                        avoidHighlightFirstOption="true"
                      />
                    </ListItem>
                    <ListItem>
                      {
                        componentsList.forEach((value) => {
                          if (value !== null && value !== '') {
                            if (value.charAt(0) === 'V' || value.charAt(0) === 'v') {
                              analysisCompArray.push({ key: value })
                            }
                          }
                        })
                      }
                      <Multiselect
                        style={{ width: '100%' }}
                        id="Branch"
                        closeOnSelect="false"
                        placeholder="Select VSRC"
                        onSelect={handleAddSelectedValueTransientAnalComp}
                        onRemove={handleRemSelectedValueTransientAnalComp}
                        options={analysisCompArray} displayValue="key"
                        avoidHighlightFirstOption="true"
                      />
                    </ListItem>
                    <ListItem>

                      <Button aria-describedby={id} variant="outlined" color="primary" size="small" onClick={handleAddExpressionClick}>
                        Add Expression
                      </Button>
                      <Tooltip title={'Add expression seperated by spaces.\n Include #branch at end of expression to indicate current  e.g v1#branch. To add multiple expression seperate them by spaces eg. v1 v2 v3#branch'}>
                        <IconButton aria-label="info">
                          <InfoOutlinedIcon style={{ fontSize: 'large' }} />
                        </IconButton>
                      </Tooltip>
                      <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleAddExpressionClose}

                        anchorOrigin={{
                          vertical: 'center',
                          horizontal: 'left'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left'
                        }}
                      >

                        <TextField id="controlBlockParam" placeHolder="enter expression" size='large' variant="outlined"
                          value={controlBlockParam}
                          onChange={handleControlBlockParam}
                        />

                      </Popover>

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
            <ExpansionPanel onClick={onTabExpand}>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                style={{ width: '100%' }}
              >
                <Typography className={classes.heading}>AC Analysis</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <form className={classes.propertiesBox} noValidate autoComplete="off">
                  <List>

                    <ListItem>
                      <TextField
                        style={{ width: '100%' }}
                        id="input"
                        size='small'
                        variant="outlined"
                        select
                        label="Type"
                        value={acAnalysisControlLine.input}
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
                      <TextField id="pointsBydecade" label="Points/scale" size='small' variant="outlined"
                        value={acAnalysisControlLine.pointsBydecade}
                        error={!acAnalysisControlLine.pointsBydecade}
                        onChange={handleAcAnalysisControlLine}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField id="start" label="Start Frequency" size='small' variant="outlined"
                        value={acAnalysisControlLine.start}
                        error={!acAnalysisControlLine.start}
                        onChange={handleAcAnalysisControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>Hz</span>
                    </ListItem>
                    <ListItem>
                      <TextField id="stop" label="Stop Frequency" size='small' variant="outlined"
                        value={acAnalysisControlLine.stop}
                        error={!acAnalysisControlLine.stop}
                        onChange={handleAcAnalysisControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>Hz</span>
                    </ListItem>

                    <ListItem>

                      <Button aria-describedby={id} variant="outlined" color="primary" size="small" onClick={handleAddExpressionClick}>
                        Add Expression
                      </Button>
                      <Tooltip title={'Add expression seperated by spaces. Include #branch at end of expression to indicate current  e.g v1#branch. To add multiple expression seperate them by spaces eg. v1 v2 v3#branch'}>
                        <IconButton aria-label="info">
                          <InfoOutlinedIcon style={{ fontSize: 'large' }} />
                        </IconButton>
                      </Tooltip>
                      <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleAddExpressionClose}

                        anchorOrigin={{
                          vertical: 'center',
                          horizontal: 'left'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left'
                        }}
                      >

                        <TextField id="controlBlockParam" placeHolder="enter expression" size='large' variant="outlined"
                          value={controlBlockParam}
                          onChange={handleControlBlockParam}
                        />

                      </Popover>

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

          {/* Transfer Function Analysis */}
          <ListItem className={classes.simulationOptions} divider>
            <ExpansionPanel onClick={onTabExpand}>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                style={{ width: '97%' }}
              >
                <Typography className={classes.heading}>Transfer Function Analysis</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <form className={classes.propertiesBox} noValidate autoComplete="off">
                  <List>
                    <ListItem>
                      <input
                        type="checkbox"
                        name="Between Nodes"
                        value={tfAnalysisControlLine.outputNodes}
                        checked={tfAnalysisControlLine.outputNodes}
                        onChange={handleTfAnalysisControlLineNodes}
                        id="outputNodes"
                      />
                      <span style={{ marginLeft: '10px' }}>Output By Nodes</span>

                    </ListItem>
                    {nodeList.forEach((value) => {
                      if (value !== null && value !== '') {
                        nodeArray.push({ key: value })
                      }
                    })
                    }
                    {/* {pushZero(nodeArray)} */}
                    <ListItem>
                      <Multiselect
                        style={{ width: '100%' }}
                        id="Nodes"
                        closeOnSelect="false"
                        placeholder="Voltage between Nodes"
                        onSelect={handleAddSelectedValueTFAnal}
                        onRemove={handleRemSelectedValueTFAnal}
                        selectionLimit="2"
                        options={nodeArray} displayValue="key"
                        disable={!tfAnalysisControlLine.outputNodes}
                        avoidHighlightFirstOption="true"
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        style={{ width: '100%' }}
                        id="outputVoltageSource"
                        size='small'
                        variant="outlined"
                        select
                        label="Output Voltage SRC"
                        value={tfAnalysisControlLine.outputVoltageSource}
                        onChange={handleTfAnalysisControlLine}
                        SelectProps={{
                          native: true
                        }}
                        disabled={tfAnalysisControlLine.outputNodes}
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
                        value={tfAnalysisControlLine.inputVoltageSource}
                        error={!tfAnalysisControlLine.inputVoltageSource}
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
                    <ListItem>

                      <Button aria-describedby={id} variant="outlined" color="primary" size="small" onClick={handleAddExpressionClick}>
                        Add Expression
                      </Button>
                      <Tooltip title={'Add expression seperated by spaces.\n Include #branch at end of expression to indicate current  e.g v1#branch. To add multiple expression seperate them by spaces eg. v1 v2 v3#branch'}>
                        <IconButton aria-label="info">
                          <InfoOutlinedIcon style={{ fontSize: 'large' }} />
                        </IconButton>
                      </Tooltip>
                      <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleAddExpressionClose}

                        anchorOrigin={{
                          vertical: 'center',
                          horizontal: 'left'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left'
                        }}
                      >

                        <TextField id="controlBlockParam" placeHolder="enter expression" size='large' variant="outlined"
                          value={controlBlockParam}
                          onChange={handleControlBlockParam}
                        />

                      </Popover>

                    </ListItem>

                    <ListItem>
                      <Button id="tfAnalysisSimulate" size='small' variant="contained" color="primary" onClick={(e) => { startSimulate('tfAnalysis') }}>
                        Simulate
                      </Button>
                    </ListItem>
                  </List>
                </form>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </ListItem>
          {/* Noise Analysis */}
          <ListItem className={classes.simulationOptions} divider>
            <ExpansionPanel onClick={onTabExpand}>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                style={{ width: '97%' }}
              >
                <Typography className={classes.heading}>Noise Analysis</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <form className={classes.propertiesBox} noValidate autoComplete="off">
                  <List>
                    {nodeList.forEach((value) => {
                      if (value !== null && value !== '') {
                        nodeNoiseArray.push({ key: value })
                      }
                    })
                    }
                    {/* {pushZero(nodeArray)} */}
                    <ListItem>
                      <Multiselect
                        style={{ width: '100%' }}
                        id="Nodes"
                        closeOnSelect="false"
                        placeholder="Voltage between Nodes"
                        onSelect={handleAddSelectedValueNoiseAnal}
                        onRemove={handleRemSelectedValueNoiseAnal}
                        selectionLimit="2"
                        options={nodeNoiseArray} displayValue="key"
                        avoidHighlightFirstOption="true"
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        style={{ width: '100%' }}
                        id="inputVoltageSource"
                        size='small'
                        variant="outlined"
                        select
                        label="Input Voltage SRC"
                        value={handleNoiseAnalysisControlLine.inputVoltageSource}
                        error={!handleNoiseAnalysisControlLine.inputVoltageSource}
                        onChange={handleNoiseAnalysisControlLine}
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
                      <TextField
                        style={{ width: '100%' }}
                        id="input"
                        size='small'
                        variant="outlined"
                        select
                        label="Type"
                        value={handleNoiseAnalysisControlLine.input}
                        onChange={handleNoiseAnalysisControlLine}
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
                      <TextField id="pointsBydecade" label="Points/scale" size='small' variant="outlined"
                        value={NoiseAnalysisControlLine.pointsBydecade}
                        error={!NoiseAnalysisControlLine.pointsBydecade}
                        onChange={handleNoiseAnalysisControlLine}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField id="start" label="Start Frequency" size='small' variant="outlined"
                        value={NoiseAnalysisControlLine.start}
                        error={!NoiseAnalysisControlLine.start}
                        onChange={handleNoiseAnalysisControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>Hz</span>
                    </ListItem>
                    <ListItem>
                      <TextField id="stop" label="Stop Frequency" size='small' variant="outlined"
                        value={NoiseAnalysisControlLine.stop}
                        error={!NoiseAnalysisControlLine.stop}
                        onChange={handleNoiseAnalysisControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>Hz</span>
                    </ListItem>
                    <ListItem>
                      <input
                        type="checkbox"
                        name="Between Nodes"
                        value={NoiseAnalysisControlLine.outputSpectrum}
                        checked={NoiseAnalysisControlLine.outputSpectrum}
                        onChange={handleNoiseOutputMode}
                        id="outputSpectrum"
                      />
                      <span style={{ marginLeft: '10px' }}>Show Noise Spectrum</span>

                    </ListItem>

                    <ListItem>

                      <Button aria-describedby={id} variant="outlined" color="primary" size="small" onClick={handleAddExpressionClick}>
                        Add Expression
                      </Button>
                      <Tooltip title={'Add expression seperated by spaces.\n Include #branch at end of expression to indicate current  e.g v1#branch. To add multiple expression seperate them by spaces eg. v1 v2 v3#branch'}>
                        <IconButton aria-label="info">
                          <InfoOutlinedIcon style={{ fontSize: 'large' }} />
                        </IconButton>
                      </Tooltip>
                      <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleAddExpressionClose}

                        anchorOrigin={{
                          vertical: 'center',
                          horizontal: 'left'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left'
                        }}
                      >

                        <TextField id="controlBlockParam" placeHolder="enter expression" size='large' variant="outlined"
                          value={controlBlockParam}
                          onChange={handleControlBlockParam}
                        />

                      </Popover>

                    </ListItem>

                    <ListItem>
                      <Button id="noiseAnalysisSimulate" size='small' variant="contained" color="primary" onClick={(e) => { startSimulate('noiseAnalysis') }}>
                        Simulate
                      </Button>
                    </ListItem>
                  </List>
                </form>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </ListItem>

          <ListItem style={isSimRes ? {} : { display: 'none' }} onClick={handlesimulateOpen} >
            <Button size='small' variant="contained" color="primary" style={{ margin: '10px auto' }} onClick={handlesimulateOpen}>
              Simulation Result
            </Button>
          </ListItem>
        </List>
      </div>
    </>
  )
}

SimulationProperties.propTypes = {
  ltiSimResult: PropTypes.object,
  setLtiSimResult: PropTypes.object,
  dcSweepcontrolLine: PropTypes.object,
  transientAnalysisControlLine: PropTypes.object,
  acAnalysisControlLine: PropTypes.object,
  tfAnalysisControlLine: PropTypes.object,
  NoiseAnalysisControlLine: PropTypes.object
}
