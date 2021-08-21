import React, { useEffect } from 'react'
import {
  Button,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  FormControlLabel,
  InputLabel,
  CardMedia,
  CardContent,
  CardActionArea,
  Card,
  Checkbox,
  Snackbar,
  IconButton,
  Chip,
  Input
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import DeleteIcon from '@material-ui/icons/Delete'
import queryString from 'query-string'
import CloseIcon from '@material-ui/icons/Close'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import api from '../../utils/Api'
import './LTI.css'

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: 300,
    minWidth: 500
  },
  media: {
    height: 0,
    paddingTop: '56.25%' // 16:9
  },
  title: {
    fontSize: 14,
    color: '#80ff80'
  },
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  },
  delete: {
    backgroundColor: 'red',
    color: 'white'
  }
}))

export default function LTIConfig () {
  const classes = useStyles()

  const [ltiDetails, setLTIDetails] = React.useState({
    secretKey: '',
    consumerKey: '',
    configURL: '',
    configExists: false,
    consumerError: '',
    score: '',
    initialSchematic: '',
    modelSchematic: '',
    testCase: null,
    scored: true,
    id: ''
  })

  const { secretKey, consumerKey, configURL, configExists, score, modelSchematic } = ltiDetails
  const [schematic, setSchematic] = React.useState('')
  const [history, setHistory] = React.useState([])
  const [historyId, setHistoryId] = React.useState('')
  const [schematics, setSchematics] = React.useState([])
  const [update, setUpdate] = React.useState(false)
  const [submitMessage, setSubmitMessage] = React.useState('')
  const [activeSim, setActiveSim] = React.useState(null)
  const [simParam, setSimParam] = React.useState([])
  const [graphSimParams, setGraphSimParams] = React.useState([])

  useEffect(() => {
    if (activeSim) {
      var arr = []
      if (activeSim.result.graph === 'true') {
        // eslint-disable-next-line
        activeSim.result.data.map((i) => {
          // eslint-disable-next-line
          i.labels.map((params) => {
            if (!arr.includes(params)) {
              arr.push(params)
            }
          })
        })
      }
      setGraphSimParams(arr)
    }
  }, [activeSim])

  useEffect(() => {
    var url = queryString.parse(window.location.href.split('lti?')[1])
    const token = localStorage.getItem('esim_token')
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    api.get(`save/versions/${url.id}`, config).then(res => {
      res.data.map(ele => {
        ele.save_time = new Date(ele.save_time)
        return 0
      })
      setSchematics(res.data)
    }).catch(err => {
      console.log(err)
    })
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (historyId !== 'None' && history !== []) {
      var temp = history.find(ele => ele.id === historyId)
      console.log('CHANGING ACTIVE SIM')
      setActiveSim(temp)
    }
    // eslint-disable-next-line
  }, [history, historyId])

  useEffect(() => {
    var url = queryString.parse(window.location.href.split('lti?')[1])
    const token = localStorage.getItem('esim_token')
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    api.get(`lti/exist/${url.id}`, config).then(res => {
      setLTIDetails(
        {
          modelSchematic: res.data.model_schematic,
          secretKey: res.data.secret_key,
          consumerKey: res.data.consumer_key,
          configURL: res.data.config_url,
          score: res.data.score,
          configExists: true,
          initialSchematic: res.data.model_schematic,
          testCase: res.data.test_case,
          scored: res.data.scored,
          id: res.data.id
        })
      setSchematic(`${res.data.model_schematic.version}-${res.data.model_schematic.branch}`)
      setSimParam(res.data.sim_params)
      if (res.data.test_case === null) {
        setHistoryId('None')
      } else {
        setHistoryId(res.data.test_case)
      }
    }).catch(err => {
      console.log(err)
      api.get(`save/${url.id}/${url.version}/${url.branch}`, config).then(res => {
        setLTIDetails(
          {
            modelSchematic: res.data,
            scored: true
          })
        setSchematic(`${res.data.version}-${res.data.branch}`)
      })
    })
  }, [])

  useEffect(() => {
    var url = queryString.parse(window.location.href.split('lti?')[1])
    const token = localStorage.getItem('esim_token')
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    api.get(`simulation/history/${url.id}/${schematic.split('-')[0]}/${schematic.split('-')[1]}/${null}`, config).then(res => {
      res.data.map(ele => {
        ele.simulation_time = new Date(ele.simulation_time)
        return 0
      })
      setHistory(res.data)
    }).catch(err => {
      console.log(err)
    })
  }, [schematic])

  // eslint-disable-next-line
  const handleLTIGenerate = () => {
    var score = ''
    if (!ltiDetails.scored) {
      score = null
    } else {
      score = ltiDetails.score
    }
    const body = {
      consumer_key: ltiDetails.consumerKey,
      secret_key: ltiDetails.secretKey,
      model_schematic: ltiDetails.modelSchematic.id,
      score: score,
      initial_schematic: ltiDetails.modelSchematic.id,
      test_case: ltiDetails.testCase,
      scored: ltiDetails.scored,
      sim_params: simParam
    }
    console.log(body)
    api.post('lti/build/', body)
      .then(res => {
        setLTIDetails({
          ...ltiDetails,
          configURL: res.data.config_url,
          configExists: true,
          consumerError: '',
          score: res.data.score,
          id: res.data.id
        })
        return res.data
      })
      .catch((err) => {
        console.log(err.data)
        setLTIDetails({ ...ltiDetails, consumerError: 'An error was encountered while setting the details!' })
      })
  }

  const handleUpdateClose = () => {
    setUpdate(false)
  }

  const handleDeleteLTIApp = () => {
    api.delete(`lti/delete/${ltiDetails.modelSchematic.id}`)
      .then(res => {
        setLTIDetails({
          secretKey: '',
          consumerKey: '',
          configURL: '',
          configExists: false,
          consumerError: '',
          score: '',
          initialSchematic: '',
          modelSchematic: modelSchematic,
          testCase: null,
          id: ''
        })
        setHistoryId('')
        setSimParam([])
      })
      .catch(error => console.log(error))
  }

  const handleConsumerKey = (e) => {
    setLTIDetails({ ...ltiDetails, consumerKey: e.target.value })
  }

  const handleSecretKey = (e) => {
    setLTIDetails({ ...ltiDetails, secretKey: e.target.value })
  }

  const handleScore = (e) => {
    if (e.target.value > 1 || e.target.value < 0) {
      // To-DO: Show error message
    } else {
      setLTIDetails({ ...ltiDetails, score: e.target.value })
    }
  }

  const handleCheckChange = (e) => {
    setLTIDetails({ ...ltiDetails, scored: e.target.checked })
  }

  const handleChange = (e) => {
    var schematic = null
    schematics.forEach(element => {
      if (element.version === e.target.value.split('-')[0] && element.branch === e.target.value.split('-')[1]) {
        schematic = element
      }
    })
    setSchematic(e.target.value)
    setLTIDetails({ ...ltiDetails, modelSchematic: schematic })
  }

  const handleChangeSim = (e) => {
    setLTIDetails({ ...ltiDetails, testCase: e.target.value })
    setHistoryId(e.target.value)
    setSimParam([])
  }

  const handleSimParamChange = (event) => {
    setSimParam(event.target.value)
  }

  const handleOnClick = () => {
    var score = ''
    if (!ltiDetails.scored) {
      score = null
    } else {
      score = ltiDetails.score
    }
    const body = {
      consumer_key: ltiDetails.consumerKey,
      secret_key: ltiDetails.secretKey,
      model_schematic: ltiDetails.modelSchematic.id,
      score: score,
      initial_schematic: ltiDetails.modelSchematic.id,
      test_case: ltiDetails.testCase,
      scored: ltiDetails.scored,
      id: ltiDetails.id,
      sim_params: simParam
    }
    console.log(body)
    api.post('lti/update/', body)
      .then(res => {
        setLTIDetails({
          ...ltiDetails,
          configURL: res.data.config_url,
          configExists: true,
          consumerError: '',
          score: res.data.score
        })
        setUpdate(true)
        setSubmitMessage('Updated Successfully')
        return res.data
      })
      .catch((err) => {
        console.log(err.data)
        setSubmitMessage('An error was encountered!')
      })
  }

  const handleUrlCopy = () => {
    var copyText = document.querySelector('.lti-url')
    console.log(copyText)
    copyText.select()
    copyText.setSelectionRange(0, 99999)
    document.execCommand('copy')
  }

  return (
    <>
      {ltiDetails && <>
        <div style={{ display: 'flex' }}>
          <Card className={classes.root} style={{ marginLeft: '2%' }}>
            <CardActionArea>
              <CardMedia
                className={classes.media}
                image={ltiDetails.modelSchematic.base64_image}
                title="Schematic"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  Schematic
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          {/* {ltiDetails.initialSchematic && <Card className={classes.root} style={{ marginLeft: '2%' }}>
            <CardActionArea>
              <CardMedia
                className={classes.media}
                image={initial.base64_image}
                title="Initial Schematic"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  Initial Schematic
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>} */}
          <div style={{ minWidth: '500px', marginLeft: '2%', marginTop: '2%' }}>
            {ltiDetails.consumerError && <h3>{ltiDetails.consumerError}</h3>}
            <TextField id="standard-basic" label="Consumer Key" defaultValue={consumerKey} onChange={handleConsumerKey} value={consumerKey} />
            <TextField style={{ marginLeft: '1%' }} id="standard-basic" label="Secret Key" defaultValue={secretKey} onChange={handleSecretKey} value={secretKey} />
            <TextField style={{ marginLeft: '1%' }} id="standard-basic" label="Score" defaultValue={score} onChange={handleScore} value={score} disabled={!ltiDetails.scored} />
            <FormControl style={{ marginTop: '1%' }} className={classes.formControl}>
              <InputLabel htmlFor="outlined-age-native-simple">Schematic</InputLabel>
              <Select
                labelId="demo-simple-select-placeholder-label-label"
                id="demo-simple-select-placeholder-label"
                value={schematic}
                style={{ minWidth: '300px' }}
                onChange={handleChange}
                label="Schematic"
                className={classes.selectEmpty}
              >
                {schematics.map(schematic => {
                  return <MenuItem key={schematic.version} value={`${schematic.version}-${schematic.branch}`}>{schematic.name} of variation {schematic.branch} saved at {schematic.save_time.toLocaleString()}</MenuItem>
                })}
              </Select>
            </FormControl>
            <FormControl style={{ marginLeft: '2%', marginTop: '1%' }} className={classes.formControl}>
              <InputLabel htmlFor="outlined-age-native-simple">Test Case</InputLabel>
              {history && <Select
                labelId="select-simulation-history"
                id="select-sim"
                value={historyId}
                style={{ minWidth: '300px' }}
                onChange={handleChangeSim}
                label="Test Case"
                className={classes.selectEmpty}
                inputProps={{ readOnly: !ltiDetails.scored }}
              >
                <MenuItem value={null}>
                  None
                </MenuItem>
                {history.map(sim => {
                  return <MenuItem key={sim.id} value={sim.id}>{sim.simulation_type} at {sim.simulation_time.toLocaleString()}</MenuItem>
                })}
              </Select>}
            </FormControl>
            <br />
            {activeSim && <FormControl style={{ marginTop: '1%', minWidth: 200 }} className={classes.formControl}>
              <InputLabel id="demo-mutiple-chip-label">Comparison Parameter</InputLabel>
              {history && <Select
                labelId="select-comparison-parameter"
                id="demo-mutiple-chip"
                multiple
                value={simParam}
                onChange={handleSimParamChange}
                input={<Input id="select-multiple-chip" />}
                inputProps={{ readOnly: !ltiDetails.scored }}
                renderValue={(selected) => (
                  <div className={classes.chips}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} className={classes.chip} />
                    ))}
                  </div>
                )}
              >
                {activeSim.result.graph === 'true'
                  ? graphSimParams.map((params) => {
                    return (
                      <MenuItem key={`${params}-${Math.random()}`} value={params}>{params}</MenuItem>
                    )
                  })
                  : activeSim.result.data.map((params) => {
                    return (
                      <MenuItem key={params[0]} value={params[0]}>
                        {params[0]}
                      </MenuItem>
                    )
                  })}
              </Select>}
            </FormControl>}
            <FormControlLabel
              style={{ marginLeft: '1%', marginTop: '2%' }}
              control={
                <Checkbox
                  checked={ltiDetails.scored}
                  onChange={handleCheckChange}
                  name="scored"
                  color="primary"
                />
              }
              label="Scored?"
            />
          </div>
        </div>
        <div>
          <Button style={{ marginTop: '1%', marginLeft: '2%', minWidth: 300 }} disableElevation variant="contained" color="primary" href='/eda/#/dashboard' startIcon={<ArrowBackIcon />}>
            Return to Dashboard
          </Button>
          <Button style={{ marginTop: '1%', marginLeft: '1%', minWidth: 300 }} disableElevation variant="contained" color="primary" disabled={configExists} onClick={handleLTIGenerate}>
            Create LTI URL
          </Button>
          {configExists &&
            <Button
              style={{ marginLeft: '1%', marginTop: '1%', minWidth: 300 }}
              disableElevation
              color="primary"
              variant="contained"
              href={`#/submission?id=${ltiDetails.modelSchematic.save_id}&version=${ltiDetails.modelSchematic.version}&branch=${ltiDetails.modelSchematic.branch}`}
            >
              Submissions
            </Button>}
          {configExists && <Button
            style={{ marginLeft: '1%', marginTop: '1%', minWidth: 297 }}
            disableElevation
            color="primary"
            variant="contained"
            onClick={handleOnClick} >
            Update LTI App
          </Button>}
          {configExists &&
            <Button
              style={{ marginLeft: '1%', marginTop: '1%', minWidth: 300 }}
              disableElevation
              variant="contained"
              className={classes.delete}
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteLTIApp()}
            >
              Delete
            </Button>}
          {configURL && <div style={{ display: 'flex', marginTop: '1%', marginLeft: '2%' }}>
            <h3 className={classes.config} style={{ float: 'left', marginTop: '1.1%' }}>URL for LTI Access:</h3>
            <h3 className={classes.config} style={{ float: 'left' }}>
              <TextareaAutosize className="lti-url" value={configURL} maxRows={1} style={{ fontSize: '18px', width: 1200, maxWidth: 1200, border: 'none' }} />
            </h3>
            <Button style={{ float: 'right', height: '50%', marginTop: '0.7%', marginLeft: '1%', minWidth: 200 }} disableElevation variant="contained" color="primary" onClick={handleUrlCopy}>
              Copy LTI URL
            </Button>

          </div>}
        </div>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          open={update}
          autoHideDuration={2000}
          onClose={handleUpdateClose}
          message={submitMessage}
          action={
            <>
              <IconButton size="small" aria-label="close" color="inherit" onClick={handleUpdateClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          }
        />
      </>}
    </>
  )
}
