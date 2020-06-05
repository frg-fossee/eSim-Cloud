import React, { useState } from 'react'
import { Container, Grid, Button, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Editor from '../components/Simulator/Editor'
import NetlistUpload from '../components/Simulator/NetlistUpload'

const useStyles = makeStyles((theme) => ({
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

export default function Simulator () {
  const classes = useStyles()
  const [netlistCode, setNetlistCode] = useState('')

  const onCodeChange = (code) => {
    setNetlistCode(code)
    console.log(netlistCode)
  }
  return (
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
            <h1>NETLIST SIMULATOR</h1>
            <p>Upload Netlist to Simulate</p>
          </Paper>
        </Grid>
        {/* <NetlistUpload /> */}
        <>
          <Grid item xs={12} sm={5}>
            <Paper className={classes.paper}>
              <h2>Enter Netlist</h2>
              <Editor code={netlistCode} onCodeChange={onCodeChange}/>
              <br />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={7}>
            <Paper className={classes.paper}>
              <h2>GRAPH OUTPUT</h2>
              {/* <Graph
              labels= {['time', 'V (In)', 'V (OP)']}
              x={this.state.x_1}
              y1={this.state.y1_1}
              y2={this.state.y2_1}
            /> */}
            </Paper>
          </Grid>

        </>
      </Grid>
    </Container>
  )
}
