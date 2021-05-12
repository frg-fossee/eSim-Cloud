import React, {useEffect} from 'react'
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
  TableRow, useEventCallback

} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import { useSelector } from 'react-redux'
import randomstring from 'randomstring'

import Graph from '../Shared/Graph'
import api from "../../utils/Api";

var FileSaver = require('file-saver')


const Transition = React.forwardRef(function Transition(props, ref) {
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
export default function SimulationScreen({ open, close, isResult, task_id }) {
  const classes = useStyles()
  const result = useSelector((state) => state.simulationReducer)
  const [xscale, setXScale] = React.useState('si')
  const [yscale, setYScale] = React.useState('si')
  const [precision, setPrecision] = React.useState(5)
  const precisionArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
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
  const toFixed = (x) => {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1])
      if (e) {
        x *= Math.pow(10,e-1)
        x = '0.' + (new Array(e)).join('0') + x.toString().substring(2)
      }
    } else {
      var e = parseInt(x.toString().split('+')[1])
      if (e > 20) {
        e -= 20
        x /= Math.pow(10,e)
        x += (new Array(e+1)).join('0')
      }
    }
    return x
  }
  const decimalCount = (num1, num2) => {
    var difference = toFixed(num1) - toFixed(num2)
    const numStr = toFixed(difference).toString()
    if(Math.abs(difference) < 1){
      if (numStr.includes('.')) {
        return ['decimal', numStr.split('.')[1].length]
      }
    }
    else{
      return ['notDecimal', numStr.split('.')[0].length]
    }
    return ['notDecimal', 1]
  }

  const setScales = () => {
    var countX = decimalCount(Math.min(...result.graph.x_points), Math.max(...result.graph.x_points))
    var countY = decimalCount(Math.min(...result.graph.y_points[0]), Math.max(...result.graph.y_points[0]))
    if(countX[0] === 'decimal'){
      if(countX[1] > 0 && countX[1] <= 4){
        setXScale('m')
      }
      else if(countX[1] > 4 && countX[1] <= 7){
        setXScale('u')
      }
      else if(countX[1] > 7 && countX[1] <= 10){
        setXScale('n')
      }
      else if(countX[1] > 10 && countX[1] <= 12){
        setXScale('p')
      }
    }
    else{
      if(countX[1] > 0 && countX[1] <= 4){
        setXScale('si')
      }
      else if(countX[1] > 4 && countX[1] <= 7){
        setXScale('K')
      }
      else if(countX[1] > 7 && countX[1] <= 10){
        setXScale('M')
      }
      else if(countX[1] > 10){
        setXScale('G')
      }
    }
    if(countY[0] === 'decimal'){
      if(countY[1] > 0 && countY[1] <= 4){
        setYScale('m')
      }
      else if(countY[1] > 4 && countY[1] <= 7){
        setYScale('u')
      }
      else if(countY[1] > 7 && countY[1] <= 10){
        setYScale('n')
      }
      else if(countY[1] > 10 && countY[1] <= 12){
        setYScale('p')
      }
    }
    else{
      if(countY[1] > 0 && countY[1] <= 4){
        setYScale('si')
      }
      else if(countY[1] > 4 && countY[1] <= 7){
        setYScale('K')
      }
      else if(countY[1] > 7 && countY[1] <= 10){
        setYScale('M')
      }
      else if(countY[1] > 10){
        setYScale('G')
      }
    }
  }
  useEffect(() => {
    if(isResult === true){
      if(result.graph !== {}){
        setScales()
      }
      const formData = new FormData()
      const token = localStorage.getItem('esim_token')
      var csvString = generateCSV()
      var blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' })
      var fileName = randomstring.generate({length: 15}) + '.csv'
      var file = new File([blob], fileName)
      formData.append('output', file)

      const config = {
        headers: {
          'content-type': 'multipart/form-data'
        }
      }
      if (token) {
        config.headers.Authorization = `Token ${token}`
      }
      api.post(`simulation/output/${task_id}`, formData, config)
    }

  }, [isResult])

  const handleXScale = (evt) => {
    setXScale(evt.target.value)
  }

  const handleYScale = (evt) => {
    setYScale(evt.target.value)
  }
  const handlePrecision = (evt) => {
    setPrecision(evt.target.value)
  }
  const generateCSV = () => {
    var headings = ""
    result.graph.labels.forEach(label => {
      headings = headings + label + ","
    })

    headings = headings.slice(0, -1)
    headings += "\n"
    var downloadString = ""

    for (var x = 0; x < result.graph.x_points.length; x++) {
      downloadString += result.graph.x_points[x];
      for (var y = 0; y < result.graph.y_points.length; y++) {
        downloadString = downloadString + "," + result.graph.y_points[y][x]
      }
      downloadString += "\n"
    }

    downloadString = headings.concat(downloadString)
    return downloadString
  }
  const handleCsvDownload = () => {
    var downloadString = generateCSV()
    var blob = new Blob([downloadString], { type: 'text/plain;charset=utf-8' })
    FileSaver.saveAs(blob, `graph_points_eSim_on_cloud.csv`)
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
            {isResult === true ? <>
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
                        {result.isGraph === 'true' && <Button variant="contained" style={{ marginLeft: "1%" }} color="primary" size="medium" onClick={handleCsvDownload}>
                          Download Graph Output
                        </Button>}
                      </div>
                      <Graph
                        labels={result.graph.labels}
                        x={result.graph.x_points}
                        y={result.graph.y_points}
                        xscale={xscale}
                        yscale={yscale}
                        precision={precision}
                      />
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
                          id="xscale"
                          size='small'
                          variant="outlined"
                          select
                          label="Select Scale"
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
                      </div>

                      <TableContainer component={Paper}>
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
                                <TableCell align="center">{(parseFloat(line.split(' ')[2]) / scales[xscale]).toFixed(precision)}</TableCell>
                                <TableCell align="center">{xscale === 'si' ? '' : xscale}{line.split(' ')[3]}</TableCell>
                              </TableRow>
                            ))
                            }

                          </TableBody>
                        </Table>
                      </TableContainer>

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
  isResult: PropTypes.bool
  // simResults: PropTypes.object
}
