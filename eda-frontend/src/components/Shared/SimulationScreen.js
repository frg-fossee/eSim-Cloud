import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Slide,
  Button,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Grid,
  TextField,
  Paper,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import { useSelector } from 'react-redux'
import api from '../../utils/Api'
import queryString from 'query-string'

import Graph from './Graph'

const FileSaver = require('file-saver')

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative'
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1
  },
  header: {
    padding: theme.spacing(5, 0, 6),
    color: '#fff'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    backgroundColor: '#404040',
    color: '#fff'
  }
}))
// {details:{},title:''} simResults
export default function SimulationScreen ({ open, close, isResult, taskId, simType = 'NgSpiceSimulator' }) {
  const classes = useStyles()
  const result = useSelector((state) => state.simulationReducer)
  const stitle = useSelector((state) => state.saveSchematicReducer.title)
  const netlist = useSelector((state) => state.netlistReducer.netlist)
  const [xscale, setXScale] = React.useState('si')
  const [yscale, setYScale] = React.useState('si')
  const [scalesNonGraphArray, setScalesNonGraph] = useState([])
  const [scalesNonGraphArrayCompare, setScalesNonGraphCompare] = useState([])
  const [exactDecimal, setExactDecimal] = useState([])
  const [exactDecimalCompare, setExactDecimalCompare] = useState([])
  const [notation, setNotation] = React.useState('Engineering')
  const [precision, setPrecision] = React.useState(5)
  const [history, setHistory] = React.useState('')
  const [historyId, setHistoryId] = React.useState('')
  const [comparingSim, setComparingSim] = React.useState('')
  const [compare, setCompare] = React.useState(false)
  const [compareNetlist, setCompareNetlist] = React.useState(false)
  const precisionArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const scalesNonGraph = []
  const scalesNonGraphCompare = []
  const exactDecimalArray = []
  const exactDecimalArrayCompare = []
  const scales = {
    G: 1000000000,
    M: 1000000,
    K: 1000,
    si: 1,
    m: 0.001,
    u: 0.000001,
    n: 0.000000001,
    p: 0.000000000001
  }

  useEffect(() => {
    if (close) {
      setHistoryId('')
      setCompare(false)
      setComparingSim('')
    }
  }, [close])
  useEffect(() => {
    if (open) {
      const url = queryString.parse(window.location.href.split('editor?')[1])
      let getUrl = ''
      const token = localStorage.getItem('esim_token')
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      }
      if (url.id) {
        getUrl = `simulation/history/${url.id}/${url.version}/${url.branch}/${simType}`
      } else {
        getUrl = `simulation/history/simulator/${simType}`
      }
      if (token) {
        config.headers.Authorization = `Token ${token}`

        api.get(getUrl, config).then(res => {
          const arr = []
          const temp2 = (result.isGraph === 'true')
          res.data.map((ele, index) => {
            ele.simulation_time = new Date(ele.simulation_time)
            if (ele.result === null) {
              arr.push(index)
            } else {
              var temp = (ele.result.graph === 'true')
              if (!ele.result.graph || temp !== temp2) {
                arr.push(index)
              }
            }
            if (ele.task === taskId) {
              arr.push(index)
            }
            return 0
          })
          for (let i = arr.length - 1; i >= 0; i--) {
            res.data.splice(arr[i], 1)
          }
          setHistory(res.data)
        }).catch(err => {
          console.log(err)
        })
      }
    }
    // eslint-disable-next-line
  }, [open])

  const handleChangeSim = (e) => {
    setHistoryId(e.target.value)
    let schematic = []
    if (e.target.value !== '') {
      setCompare(true)
      history.forEach(element => {
        const data = element.result.data
        if (element.id === e.target.value) {
          if (element.result.graph === 'true') {
            const simResultGraph = { labels: [], x_points: [], y_points: [] }
            // populate the labels
            for (let i = 0; i < data.length; i++) {
              simResultGraph.labels[0] = data[i].labels[0]
              const lab = data[i].labels
              // lab is an array containeing labels names ['time','abc','def']
              simResultGraph.x_points = data[0].x

              // labels
              for (let x = 1; x < lab.length; x++) {
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
            schematic = simResultGraph
            let val, idx
            setScales(1, val, idx, null, null, schematic)
          } else {
            const simResultText = []
            for (let i = 0; i < data.length; i++) {
              let postfixUnit = ''
              if (data[i][0].includes('#branch')) {
                postfixUnit = 'A'
              } else if (data[i][0].includes('transfer_function')) {
                postfixUnit = ''
              } else if (data[i][0].includes('impedance')) {
                postfixUnit = 'Ohm'
              } else {
                if (data[i][0][0] !== 'V') {
                  data[i][0] = `V(${data[i][0]})`
                }
                postfixUnit = 'V'
              }

              simResultText.push(data[i][0] + ' ' + data[i][1] + ' ' + parseFloat(data[i][2]) + ' ' + postfixUnit + '\n')
            }
            schematic = simResultText
            addScalesNonGraph(0, schematic, exactDecimalArrayCompare, scalesNonGraphCompare, setScalesNonGraphCompare, setExactDecimalCompare)
          }
          setCompareNetlist(element.netlist)
        }
      })
      setComparingSim(schematic)
    } else {
      setCompare(false)
    }
  }
  // DO NOT CHANGE THIS FUNCTION
  const toFixed = (x) => {
    let e = 0
    if (Math.abs(x) < 1.0) {
      e = parseInt(x.toString().split('e-')[1])
      if (e) {
        x *= Math.pow(10, e - 1)
        x = '0.' + (new Array(e)).join('0') + x.toString().substring(2)
      }
    } else {
      e = parseInt(x.toString().split('+')[1])
      if (e > 20) {
        e -= 20
        x /= Math.pow(10, e)
        x += (new Array(e + 1)).join('0')
      }
    }
    return x
  }

  // DO NOT CHANGE
  const decimalCount = (num1, num2) => {
    const difference = toFixed(num1) - toFixed(num2)
    const numStr = toFixed(difference).toString()
    if (Math.abs(difference) < 1) {
      if (numStr.includes('.')) {
        return ['decimal', numStr.split('.')[1].length]
      }
    } else {
      return ['notDecimal', numStr.split('.')[0].length]
    }
    return ['notDecimal', 1]
  }

  // DO NOT CHANGE
  const decimalCountNonGraph = (num) => {
    const numStr = num.toString()
    if (Math.abs(num) < 1) {
      if (numStr.includes('.')) {
        const afterDeci = numStr.split('.')[1]
        let count = 0
        while (afterDeci[count] === '0') {
          count++
        }
        return ['decimal', count + 2] // count + 2 to adjust with the scaling feature. 0.000xyz will become xyz.abc mUnit
      }
    } else {
      return ['notDecimal', numStr.split('.')[0].length]
    }
    return ['notDecimal', 1]
  }

  // DO NOT CHANGE
  const exactDecimalCount = (num) => {
    const numStr = num.toString()
    if (Math.abs(num) < 1) {
      if (numStr.includes('.')) {
        const afterDeci = numStr.split('.')[1]
        let count = 0
        while (afterDeci[count] === '0') {
          count++
        }
        return ['decimal', -1 * (count + 1)] // count + 2 to adjust with the scaling feature. 0.000xyz will become xyz.abc mUnit
      }
    } else {
      const beforeDeci = numStr.split('.')[0]
      return ['notDecimal', (beforeDeci.length - 1)]
    }
    return ['notDecimal', 0]
  }
  useEffect(() => {
    if (isResult === true) {
      let g, val, idx
      if (result.graph !== {} && result.isGraph !== 'false') {
        g = 1
        setScales(g, val, idx, null, null, result.graph)
      } else {
        g = 0
        addScalesNonGraph(g, result.text, exactDecimalArray, scalesNonGraph, setScalesNonGraph, setExactDecimal)
      }
    }
    // eslint-disable-next-line
  }, [isResult])

  // DO NOT CHANGE
  const addScalesNonGraph = (g, data, arr, scale, setScaleFunc, setStateFunc) => {
    data.forEach((line, index) => {
      setScales(g, parseFloat(line.split(' ')[2]), index, scale, setScaleFunc)
      const count = exactDecimalCount(parseFloat(line.split(' ')[2]))
      arr.push(count[1])
    })
    setStateFunc(arr)
  }

  const setScales = (g, val, idx, scale = null, setScaleFunc = null, data = null) => {
    let countX, countY
    if (g === 1) {
      countX = decimalCount(Math.min(...data.x_points), Math.max(...data.x_points))
      countY = decimalCount(Math.min(...data.y_points[0]), Math.max(...data.y_points[0]))
    } else {
      countX = decimalCountNonGraph(val)
      countY = countX // not required. used only countX for nongraphical output
    }
    if (countX[0] === 'decimal') {
      if (countX[1] > 0 && countX[1] <= 4) {
        if (g === 1) {
          setXScale('m')
        } else {
          if (scale.length <= idx || scale.length === 0) {
            scale.push('m')
            setScaleFunc(scale)
          } else {
            scale[idx] = 'm'
            setScaleFunc(scale)
          }
        }
      } else if (countX[1] > 4 && countX[1] <= 7) {
        if (g === 1) {
          setXScale('u')
        } else {
          if (scale.length <= idx || scale.length === 0) {
            scale.push('u')
            setScaleFunc(scale)
          } else {
            scale[idx] = 'u'
            setScaleFunc(scale)
          }
        }
      } else if (countX[1] > 7 && countX[1] <= 10) {
        if (g === 1) {
          setXScale('n')
        } else {
          if (scale.length <= idx || scale.length === 0) {
            scale.push('n')
            setScaleFunc(scale)
          } else {
            scale[idx] = 'n'
            setScaleFunc(scale)
          }
        }
      } else if (countX[1] > 10 && countX[1] <= 12) {
        if (g === 1) {
          setXScale('p')
        } else {
          if (scale.length <= idx || scale.length === 0) {
            scale.push('p')
            setScaleFunc(scale)
          } else {
            scale[idx] = 'p'
            setScaleFunc(scale)
          }
        }
      }
    } else {
      if (countX[1] > 0 && countX[1] <= 4) {
        if (g === 1) {
          setXScale('si')
        } else {
          if (scale.length <= idx || scale.length === 0) {
            scale.push('si')
            setScaleFunc(scale)
          } else {
            scale[idx] = 'si'
            setScaleFunc(scale)
          }
        }
      } else if (countX[1] > 4 && countX[1] <= 7) {
        if (g === 1) {
          setXScale('K')
        } else {
          if (scale.length <= idx || scale.length === 0) {
            scale.push('K')
            setScaleFunc(scale)
          } else {
            scale[idx] = 'K'
            setScaleFunc(scale)
          }
        }
      } else if (countX[1] > 7 && countX[1] <= 10) {
        if (g === 1) {
          setXScale('M')
        } else {
          if (scale.length <= idx || scale.length === 0) {
            scale.push('M')
            setScaleFunc(scale)
          } else {
            scale[idx] = 'M'
            setScaleFunc(scale)
          }
        }
      } else if (countX[1] > 10) {
        if (g === 1) {
          setXScale('G')
        } else {
          if (scale.length <= idx || scale.length === 0) {
            scale.push('G')
            setScaleFunc(scale)
          } else {
            scale[idx] = 'G'
            setScaleFunc(scale)
          }
        }
      }
    }
    if (countY[0] === 'decimal') {
      if (countY[1] > 0 && countY[1] <= 4) {
        setYScale('m')
      } else if (countY[1] > 4 && countY[1] <= 7) {
        setYScale('u')
      } else if (countY[1] > 7 && countY[1] <= 10) {
        setYScale('n')
      } else if (countY[1] > 10 && countY[1] <= 12) {
        setYScale('p')
      }
    } else {
      if (countY[1] > 0 && countY[1] <= 4) {
        setYScale('si')
      } else if (countY[1] > 4 && countY[1] <= 7) {
        setYScale('K')
      } else if (countY[1] > 7 && countY[1] <= 10) {
        setYScale('M')
      } else if (countY[1] > 10) {
        setYScale('G')
      }
    }
  }
  const handleXScale = (evt) => {
    setXScale(evt.target.value)
  }

  const handleYScale = (evt) => {
    setYScale(evt.target.value)
  }
  const handlePrecision = (evt) => {
    setPrecision(evt.target.value)
  }
  const handleNotation = (evt) => {
    setNotation(evt.target.value)
  }
  const generateCSV = () => {
    let headings = ''
    result.graph.labels.forEach(label => {
      headings = headings + label + ','
    })

    headings = headings.slice(0, -1)
    headings += '\n'
    let downloadString = ''

    for (let x = 0; x < result.graph.x_points.length; x++) {
      downloadString += result.graph.x_points[x]
      for (let y = 0; y < result.graph.y_points.length; y++) {
        downloadString = downloadString + ',' + result.graph.y_points[y][x]
      }
      downloadString += '\n'
    }

    downloadString = headings.concat(downloadString)
    return downloadString
  }
  const handleCsvDownload = () => {
    const downloadString = generateCSV()
    const blob = new Blob([downloadString], { type: 'text/plain;charset=utf-8' })
    FileSaver.saveAs(blob, 'graph_points_eSim_on_cloud.csv')
  }

  return (
    <div>
      <Dialog fullScreen open={open} onClose={close} TransitionComponent={Transition} PaperProps={{
        style: {
          backgroundColor: '#4d4d4d',
          boxShadow: 'none'
        }
      }}>
        <AppBar position="static" elevation={0} className={classes.appBar}>
          <Toolbar variant="dense" style={{ backgroundColor: '#404040' }} >
            <IconButton edge="start" color="inherit" onClick={close} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Simulation Result
            </Typography>
            <Button autoFocus color="inherit" onClick={close}>
              close
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" className={classes.header}>
          <Grid
            container
            spacing={3}
            direction="row"
            justify="center"
            alignItems="center"
          >
            {/* Card to display simualtion result screen header */}
            <Grid item xs={12} sm={12}>
              <Paper className={classes.paper}>
                <Typography variant="h2" align="center" gutterBottom>
                  {result.title}
                </Typography>
                <Typography variant="h5" align="center" component="p" gutterBottom>
                  Simulation Result for {stitle}
                </Typography>
              </Paper>
            </Grid>

            {/* Display graph result */}
            {isResult === true
              ? <>
                {

                  (result.graph !== {} && result.isGraph === 'true')
                    ? <Grid item xs={12} sm={12}>
                      <Paper className={classes.paper}>
                        <Typography variant="h4" align="center" gutterBottom>
                          GRAPH OUTPUT
                        </Typography>
                        <div style={{ padding: '15px 10px 10px 10px', margin: '20px 0px', backgroundColor: 'white', borderRadius: '5px' }}>
                          <TextField
                            style={{ width: '20%' }}
                            id="xscale"
                            size='small'
                            variant="outlined"
                            select
                            label="Select X Axis Scale"
                            value={xscale}
                            onChange={handleXScale}
                            SelectProps={{
                              native: true
                            }}
                          >
                            <option value='G'>
                              Giga (G)
                            </option>
                            <option value='M'>
                              Mega (MEG)
                            </option>
                            <option value='K'>
                              Kilo (K)
                            </option>
                            <option value='si'>
                              SI UNIT
                            </option>

                            <option value='m'>
                              Milli (m)
                            </option>
                            <option value='u'>
                              Micro (u)
                            </option>
                            <option value='n'>
                              Nano (n)
                            </option>
                            <option value='p'>
                              Pico (p)
                            </option>

                          </TextField>
                          <TextField
                            style={{ width: '20%', marginLeft: '10px' }}
                            id="yscale"
                            size='small'
                            variant="outlined"
                            select
                            label="Select Y Axis Scale"
                            value={yscale}
                            onChange={handleYScale}
                            SelectProps={{
                              native: true
                            }}
                          >
                            <option value='G'>
                              Giga (G)
                            </option>
                            <option value='M'>
                              Mega (MEG)
                            </option>
                            <option value='K'>
                              Kilo (K)
                            </option>
                            <option value='si'>
                              SI UNIT
                            </option>

                            <option value='m'>
                              Milli (m)
                            </option>
                            <option value='u'>
                              Micro (u)
                            </option>
                            <option value='n'>
                              Nano (n)
                            </option>
                            <option value='p'>
                              Pico (p)
                            </option>

                          </TextField>

                          <TextField
                            style={{ width: '20%', marginLeft: '10px' }}
                            id="precision"
                            size='small'
                            variant="outlined"
                            select
                            label="Select Precision"
                            value={precision}
                            onChange={handlePrecision}
                            SelectProps={{
                              native: true
                            }}
                          >
                            {
                              precisionArr.map((d, i) => {
                                return (
                                  <option key={i} value={d}>
                                    {d}
                                  </option>
                                )
                              })
                            }

                          </TextField>
                          {history && <FormControl variant="outlined" size='small' style={{ marginLeft: '1%' }} className={classes.formControl}>
                            <InputLabel htmlFor="outlined-age-native-simple">Compare simulation</InputLabel>
                            <Select
                              labelId="select-simulation-history"
                              id="select-sim"
                              value={historyId}
                              style={{ minWidth: '300px' }}
                              onChange={handleChangeSim}
                              label="Compare simulation"
                              className={classes.selectEmpty}
                            >
                              <MenuItem value="">
                                None
                              </MenuItem>
                              {history.map(sim => {
                                return <MenuItem key={sim.id} value={sim.id}>{sim.simulation_type} at {sim.simulation_time.toLocaleString()}</MenuItem>
                              })}
                            </Select>
                          </FormControl>}
                          {result.isGraph === 'true' && !compare && <Button variant="contained" style={{ marginLeft: '1%' }} color="primary" size="medium" onClick={handleCsvDownload}>
                            Download Graph Output
                          </Button>}
                        </div>
                        {!compare && <Graph
                          labels={result.graph.labels}
                          x={result.graph.x_points}
                          y={result.graph.y_points}
                          xscale={xscale}
                          yscale={yscale}
                          precision={precision}
                        />}
                        {compare && comparingSim && <div style={{ display: 'flex' }}>
                          <TableContainer component={Paper} style={{ float: 'left' }}>
                            <Table className={classes.table} aria-label="simple table">
                              <TableHead>
                                <TableRow>
                                  <TableCell></TableCell>
                                  {
                                    result.graph.labels.map(ele => {
                                      return <TableCell key={ele} align="center">{ele}</TableCell>
                                    })
                                  }
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow>
                                  <TableCell>Max value</TableCell>
                                  <TableCell align="center">{(Math.max(...result.graph.x_points) / scales[xscale]).toFixed(precision)} </TableCell>
                                  {
                                    result.graph.y_points.map(ele => {
                                      return <TableCell key={ele} align="center">{(Math.max(...ele) / scales[yscale]).toFixed(precision)}</TableCell>
                                    })}
                                </TableRow>
                                <TableRow>
                                  <TableCell>Min value</TableCell>
                                  <TableCell align="center">{(Math.min(...result.graph.x_points) / scales[xscale]).toFixed(precision)} </TableCell>
                                  {
                                    result.graph.y_points.map(ele => {
                                      return <TableCell key={ele} align="center">{Math.min(...ele) / scales[yscale]}</TableCell>
                                    })}
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                          <TableContainer component={Paper} style={{ float: 'right', marginLeft: '2%' }}>
                            <Table className={classes.table} aria-label="simple table">
                              <TableHead>
                                <TableRow>
                                  <TableCell></TableCell>
                                  {
                                    comparingSim.labels.map(ele => {
                                      return <TableCell key={ele} align="center">{ele}</TableCell>
                                    })
                                  }
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow>
                                  <TableCell>Max value</TableCell>
                                  <TableCell align="center">{(Math.max(...comparingSim.x_points) / scales[xscale]).toFixed(precision)} </TableCell>
                                  {
                                    comparingSim.y_points.map(ele => {
                                      return <TableCell key={ele} align="center">{(Math.max(...ele) / scales[yscale]).toFixed(precision)}</TableCell>
                                    })}
                                </TableRow>
                                <TableRow>
                                  <TableCell>Min value</TableCell>
                                  <TableCell align="center">{(Math.min(...comparingSim.x_points) / scales[xscale]).toFixed(precision)} </TableCell>
                                  {
                                    comparingSim.y_points.map(ele => {
                                      return <TableCell key={ele} align="center">{(Math.min(...ele) / scales[yscale]).toFixed(precision)}</TableCell>
                                    })}
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </div>}
                      </Paper>
                      <Paper className={classes.paper}>
                        {compare && <div style={{ display: 'flex', textAlign: 'left' }}>
                          <div style={{ width: '50%' }}>
                            <h2 style={{ marginLeft: '30%' }}>Current Netlist</h2>
                            <div>{netlist.split('\n').map((i, key) => {
                              return <h3 style={{ marginLeft: '30%' }} key={key}>{i}</h3>
                            })}</div>
                          </div>
                          <div style={{ width: '50%' }}>
                            <h2 style={{ marginLeft: '30%' }}>Compared Netlist</h2>
                            <div>{compareNetlist.split('\n').map((i, key) => {
                              return <h3 style={{ marginLeft: '30%' }} key={key}>{i}</h3>
                            })}</div>
                          </div>
                        </div>}
                      </Paper>
                    </Grid>
                    : (result.isGraph === 'true') ? <span>SOMETHING WENT WRONG PLEASE CHECK THE SIMULATION PARAMETERS.</span> : <span></span>
                }

                {
                  (result.isGraph === 'false')
                    ? <Grid item xs={12} sm={12}>
                      <Paper className={classes.paper}>
                        <Typography variant="h4" align="center" gutterBottom>
                          OUTPUT
                        </Typography>
                        <div style={{ padding: '15px 10px 10px 10px', backgroundColor: 'white', margin: '20px 0px', borderRadius: '5px' }}>
                          <TextField
                            style={{ width: '20%' }}
                            id="notation"
                            size='small'
                            variant="outlined"
                            select
                            label="Select Notation"
                            value={notation}
                            onChange={handleNotation}
                            SelectProps={{
                              native: true
                            }}
                          >
                            <option value='Engineering'>
                              Engineering Notation
                            </option>
                            <option value='Scientific'>
                              Scientific Notation
                            </option>
                          </TextField>

                          <TextField
                            style={{ width: '20%', marginLeft: '10px' }}
                            id="precision"
                            size='small'
                            variant="outlined"
                            select
                            label="Select Precision"
                            value={precision}
                            onChange={handlePrecision}
                            SelectProps={{
                              native: true
                            }}
                          >
                            {
                              precisionArr.map((d, i) => {
                                return (
                                  <option key={i} value={d}>
                                    {d}
                                  </option>
                                )
                              })
                            }

                          </TextField>
                          {history && <FormControl variant="outlined" size='small' style={{ marginLeft: '1%' }} className={classes.formControl}>
                            <InputLabel htmlFor="outlined-age-native-simple">Compare simulation</InputLabel>
                            <Select
                              labelId="select-simulation-history"
                              id="select-sim"
                              value={historyId}
                              style={{ minWidth: '300px' }}
                              onChange={handleChangeSim}
                              label="Compare simulation"
                              className={classes.selectEmpty}
                            >
                              <MenuItem value="">
                                None
                              </MenuItem>
                              {history.map(sim => {
                                return <MenuItem key={sim.id} value={sim.id}>{sim.simulation_type} at {sim.simulation_time.toLocaleString()}</MenuItem>
                              })}
                            </Select>
                          </FormControl>}
                        </div>
                        <div style={{ display: 'flex' }}>
                          <TableContainer component={Paper} style={{ float: 'left' }}>
                            <Table className={classes.table} aria-label="simple table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align="center">Node/Branch</TableCell>
                                  <TableCell align="center">Value</TableCell>
                                  <TableCell align="center">Unit</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {result.text.map((line, index) => (
                                  <TableRow key={index}>
                                    <TableCell align="center">{line.split('=')[0]}</TableCell>
                                    <TableCell align="center">
                                      {(line.split(' ')[3] === '\n')
                                        ? (parseFloat(line.split(' ')[2]))
                                        : (notation === 'Scientific'
                                          ? ((parseFloat(line.split(' ')[2]) / Math.pow(10, exactDecimal[index])).toFixed(precision).toString() + 'e' + ((exactDecimal[index]) >= 0
                                            ? '+' + (exactDecimal[index]).toString()
                                            : exactDecimal[index]).toString())
                                          : (parseFloat(line.split(' ')[2]) / scales[scalesNonGraphArray[index]]).toFixed(precision))}
                                    </TableCell>
                                    <TableCell align="center">{(scalesNonGraphArray[index] === 'si' || notation === 'Scientific' || line.split(' ')[3] === '\n') ? '' : scalesNonGraphArray[index]}{line.split(' ')[3]}</TableCell>
                                  </TableRow>
                                ))
                                }
                              </TableBody>
                            </Table>
                          </TableContainer>
                          {compare && <TableContainer component={Paper} style={{ float: 'right', marginLeft: '2%' }}>
                            <Table className={classes.table} aria-label="simple table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align="center">Node/Branch</TableCell>
                                  <TableCell align="center">Value</TableCell>
                                  <TableCell align="center">Unit</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {comparingSim.map((line, index) => {
                                  return (
                                    <TableRow key={index}>
                                      <TableCell align="center">{line.split('=')[0]}</TableCell>
                                      <TableCell align="center">
                                        {(line.split(' ')[3] === '\n')
                                          ? (parseFloat(line.split(' ')[2]))
                                          : (notation === 'Scientific'
                                            ? ((parseFloat(line.split(' ')[2]) / Math.pow(10, exactDecimalCompare[index])).toFixed(precision).toString() + 'e' + ((exactDecimalCompare[index]) >= 0
                                              ? '+' + (exactDecimalCompare[index]).toString()
                                              : exactDecimalCompare[index]).toString())
                                            : (parseFloat(line.split(' ')[2]) / scales[scalesNonGraphArrayCompare[index]]).toFixed(precision))}
                                      </TableCell>
                                      <TableCell align="center">{(scalesNonGraphArrayCompare[index] === 'si' || notation === 'Scientific' || line.split(' ')[3] === '\n') ? '' : scalesNonGraphArrayCompare[index]}{line.split(' ')[3]}</TableCell>
                                    </TableRow>
                                  )
                                })
                                }

                              </TableBody>
                            </Table>
                          </TableContainer>}
                        </div>
                      </Paper>
                      <Paper className={classes.paper}>
                        {compare && <div style={{ display: 'flex', textAlign: 'left' }}>
                          <div style={{ width: '50%' }}>
                            <h2 style={{ marginLeft: '30%' }}>Current Netlist</h2>
                            <div>{netlist.split('\n').map((i, key) => {
                              return <h3 style={{ marginLeft: '30%' }} key={key}>{i}</h3>
                            })}</div>
                          </div>
                          <div style={{ width: '50%' }}>
                            <h2 style={{ marginLeft: '30%' }}>Compared Netlist</h2>
                            <div>{compareNetlist.split('\n').map((i, key) => {
                              return <h3 style={{ marginLeft: '30%' }} key={key}>{i}</h3>
                            })}</div>
                          </div>

                        </div>}
                      </Paper>
                    </Grid>
                    : <span></span>
                }</>
              : <Grid item xs={12} sm={12}>
                <Paper className={classes.paper}>
                  <Typography variant="h6" align="center" gutterBottom>
                    SOMETHING WENT WRONG PLEASE CHECK THE NETLIST.
                  </Typography>
                </Paper>
              </Grid>
            }
          </Grid>
        </Container>
      </Dialog>
    </div>
  )
}

SimulationScreen.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  isResult: PropTypes.bool,
  simType: PropTypes.string,
  taskId: PropTypes.string
  // simResults: PropTypes.object
}
