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

export default function SimulationScreen ({ open, close }) {
  const classes = useStyles()

  const result = useSelector((state) => state.simulationReducer)

  return (
    <div>
      <Dialog fullScreen open={open} onClose={close} TransitionComponent={Transition}>
        <AppBar position="static" elevation={0} className={classes.appBar}>
          <Toolbar variant="dense" color="default" >
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
            alignItems="stretch"
          >
            <Grid item xs={12} sm={12}>
              <Paper className={classes.paper}>
                <h1>{result.title}</h1>
                <p>Simulation Result for {result.title}</p>
              </Paper>
            </Grid>

            {
              (result.graph !== {} && result.isGraph === 'true')
                ? <Grid item xs={12} sm={12}>
                  <Paper className={classes.paper}>
                    <h2>GRAPH OUTPUT</h2><Graph
                      labels={result.graph.labels}
                      x={result.graph.x1}
                      y1={result.graph.y11}
                      y2={result.graph.y21}
                    />
                  </Paper>
                </Grid>
                : <h1>No graph</h1>
            }

            {
              (result.isGraph === 'false')
                ? <Grid item xs={12} sm={8}>
                  <Paper className={classes.paper}>
                    <h2>OUTPUT</h2>
                    <h2>{result.text}</h2>
                  </Paper>
                </Grid>
                : <h1>No output</h1>
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
}
