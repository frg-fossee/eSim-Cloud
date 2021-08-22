import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Typography,
  Grid,
  TextField,
  Paper,
  Container
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import Graph from '../Shared/Graph'

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
export default function CompareGraph ({ expected, given }) {
  const classes = useStyles()
  const [xscale, setXScale] = React.useState('si')
  const [yscale, setYScale] = React.useState('si')
  const [expectedResult, setExpectedResult] = React.useState(null)
  const [givenResult, setGivenResult] = React.useState(null)
  const [precision, setPrecision] = React.useState(5)

  const precisionArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  // eslint-disable-next-line
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
    if (given) {
      console.log('givenresult', handlePreProcess(given))
      setGivenResult(handlePreProcess(given))
    }
    if (expected) {
      console.log('expectedresult', handlePreProcess(expected))
      setExpectedResult(handlePreProcess(expected))
    }
  // eslint-disable-next-line
  }, [given, expected])

  const handlePreProcess = (element) => {
    let schematic = []
    const data = element.data
    if (element.graph === 'true') {
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
    }
    return schematic
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

  return (
    <div>
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
                Your Result
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
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Paper className={classes.paper}>
              <Grid item xs={12} sm={12}>
                {givenResult && <>
                  <Graph
                    labels={givenResult.labels}
                    x={givenResult.x_points}
                    y={givenResult.y_points}
                    xscale={xscale}
                    yscale={yscale}
                    precision={precision}
                  />
                </>}
              </Grid>
              <Grid item xs={12} sm={12}>
                {expectedResult && <>
                  <Graph
                    labels={expectedResult.labels}
                    x={expectedResult.x_points}
                    y={expectedResult.y_points}
                    xscale={xscale}
                    yscale={yscale}
                    precision={precision}
                  />
                </>}
              </Grid>
            </Paper>
          </Grid>

        </Grid>
      </Container>
    </div >
  )
}

CompareGraph.propTypes = {
  expected: PropTypes.object,
  given: PropTypes.object
  // simResults: PropTypes.object
}
