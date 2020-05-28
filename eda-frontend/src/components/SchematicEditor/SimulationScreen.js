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

export default function SimulationScreen ({ open, close, simResult }) {
  const classes = useStyles()

  // const x1 = []
  // const y11 = []
  // const y21 = []

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
                <h1>{simResult.type}</h1>
                <p>Simulation Result for {simResult.type}</p>
              </Paper>
            </Grid>

            {simResult.graph === 'true'
              ? <Grid item xs={12} sm={12}>
                <Paper className={classes.paper}>
                  <h2>GRAPH OUTPUT</h2>
                  <Graph
                    x={simResult.x1}
                    y1={simResult.y11}
                    y2={simResult.y21}
                  />
                </Paper>
              </Grid>
              : <Grid item xs={12} sm={7}>
                <Paper className={classes.paper}>
                  <h2>OUTPUT</h2>
                  <h1>{simResult.st}</h1>
                  {/* {
                    simResult.st.map((res) => {
                      return (
                        <h1 key={res}>{res}</h1>
                      )
                    })
                  } */}
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
  simResult: PropTypes.object
}
