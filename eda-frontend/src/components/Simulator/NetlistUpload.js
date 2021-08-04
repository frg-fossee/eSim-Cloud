/* eslint-disable react/prop-types */
import React, { Component } from 'react'
import { Grid, Button, Paper } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import api from '../../utils/Api'

const styles = (theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    backgroundColor: '#404040',
    color: '#fff'
  },
  finlabel: {
    cursor: 'pointer',
    color: '#9feaf9',
    padding: theme.spacing(1),
    border: '2px solid #9feaf9'
  },
  finput: {
    opacity: 0,
    position: 'absolute',
    zIndex: -1
  }
})

class NetlistUpload extends Component {
  constructor (props) {
    super(props)
    this.state = {
      file: null,
      filename: 'Choose Netlist',
      x_1: [],
      y1_1: [],
      y2_1: []
    }
    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.onChange = this.onChange.bind(this)
    this.netlistUpload = this.netlistUpload.bind(this)
  }

  onChange (e) {
    this.setState({
      file: e.target.files[0],
      filename: e.target.files[0].name
    })
  }

  onFormSubmit (e) {
    // Stop default form submit
    e.preventDefault()
    this.netlistUpload(this.state.file)
      .then((response) => {
        const res = response.data
        const getUrl = 'simulation/status/'.concat(res.details.task_id)
        this.simulationResult(getUrl)
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  // Upload the nelist
  netlistUpload (file) {
    const token = localStorage.getItem('esim_token')
    const formData = new FormData()
    formData.append('file', file)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return api.post('simulation/upload', formData, config)
  }

  // Get the simulation result with task_Id
  simulationResult (url) {
    api
      .get(url)
      .then((res) => {
        if (res.data.state === 'PROGRESS' || res.data.state === 'PENDING') {
          setTimeout(this.simulationResult(url), 1000)
        } else {
          this.setState({
            x_1: res.data.details.data[0].x,
            y1_1: res.data.details.data[0].y[0],
            y2_1: res.data.details.data[0].y[1]
          })
        }
      })
      .then((res) => { })
      .catch(function (error) {
        console.log(error)
      })
  }

  fileData = () => {
    if (this.state.file) {
      return (
        <div>
          <h3>File Details:</h3>
          <p>File Name: {this.state.file.name}</p>
          <p>File Type: Ngspice Netlist</p>
        </div>
      )
    } else {
      return (
        <div>
          <h4>Choose Netlist before pressing UPLOAD button</h4>
        </div>
      )
    }
  };

  render () {
    const { classes } = this.props
    return (
      <>
        <Grid item xs={12} sm={5}>
          <Paper className={classes.paper}>
            <h2>SUBMIT NETLIST</h2>
            <form onSubmit={this.onFormSubmit} style={{ marginTop: '45px' }}>
              <label htmlFor="netlist" className={classes.finlabel}>
                {this.state.filename}
              </label>
              <input
                type="file"
                id="netlist"
                onChange={this.onChange}
                className={classes.finput}
              />
              <br />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                style={{ marginTop: '30px' }}
              >
                Upload
              </Button>
            </form>
            <br />
            {this.fileData()}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={7}>
          <Paper className={classes.paper}>
            <h2>GRAPH OUTPUT</h2>
          </Paper>
        </Grid>
      </>
    )
  }
}

export default withStyles(styles, { withTheme: true })(NetlistUpload)
