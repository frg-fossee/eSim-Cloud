import React from 'react'
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
  Container
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import { useSelector } from 'react-redux'

import Graph from '../Shared/Graph'

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
export default function SimulationScreen ({ open, close }) {
  const classes = useStyles()
  const result = useSelector((state) => state.simulationReducer)
  const stitle = useSelector((state) => state.netlistReducer.title)
  const [scale, setScale] = React.useState('si')
  // eslint-disable-next-line no-unused-vars
  const scales = {
    m: 0.001,
    u: 0.000001,
    n: 0.000000001,
    p: 0.000000000001
  }
  const handleScale = (evt) => {
    setScale(evt.target.value)
  }

  // const [simRes,setSimRes] = React.useState({})

  //  const getCleanData = () => {

  //   setSimRes(simResults)
  //   console.log("hello",simRes)
  // }
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
            <Grid item xs={12} sm={12}>
              <Paper className={classes.paper}>
                <Typography variant="h2" align="center" gutterBottom>
                  {result.title}
                </Typography>
                <Typography variant="h5" align="center" component="p" gutterBottom>
                  Simulation Result for {stitle} *
                </Typography>
                <div style={{ backgroundColor: 'white', padding: '20px' }}>
                  <TextField
                    style={{ width: '30%' }}
                    id="scale"
                    size='small'
                    variant="outlined"
                    select
                    label="Select Scale"
                    value={scale}
                    onChange={handleScale}
                    SelectProps={{
                      native: true
                    }}
                  >
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
                </div>

              </Paper>
            </Grid>

            {

              (result.graph !== {} && result.isGraph === 'true')
                ? <Grid item xs={12} sm={12}>
                  <Paper className={classes.paper}>
                    <h2>GRAPH OUTPUT</h2>
                    <Graph
                      labels={result.graph.labels}
                      x={result.graph.x_points}
                      y={result.graph.y_points}
                      scale={scale}
                    />
                  </Paper>
                </Grid>
                : <span>SOMETHING WENT WRONG PLEASE CHECK THE SIMULATION PARAMETERS.</span>
            }

            {
              (result.isGraph === 'false')
                ? <Grid item xs={12} sm={12}>
                  <Paper className={classes.paper}>
                    <Typography variant="h4" align="center" gutterBottom>
                      OUTPUT
                    </Typography>
                    {result.text.map((line, index) => {
                      return <Typography variant="h5" align="center" key={index} gutterBottom>
                        {line}
                      </Typography>
                    })}
                  </Paper>
                </Grid>
                : <span></span>
            }
          </Grid>
        </Container>
      </Dialog>
    </div>
  )
}

SimulationScreen.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func
  // simResults: PropTypes.object
}
