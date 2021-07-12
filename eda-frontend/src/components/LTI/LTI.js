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
  IconButton
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import DeleteIcon from '@material-ui/icons/Delete'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSchematics } from '../../redux/actions/index'
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

export default function LTIConfig() {
  const classes = useStyles()
  const dispatch = useDispatch()
  const schematics = useSelector(state => state.dashboardReducer.schematics)

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
    scored: true
  })

  const { secretKey, consumerKey, configURL, configExists, score, modelSchematic } = ltiDetails
  const [initial, setInitial] = React.useState('')
  const [history, setHistory] = React.useState('')
  const [historyId, setHistoryId] = React.useState('')
  const [update, setUpdate] = React.useState(false)
  const [submitMessage, setSubmitMessage] = React.useState('')

  useEffect(() => {
    dispatch(fetchSchematics())
  }, [dispatch])

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
          initialSchematic: res.data.initial_schematic.save_id,
          testCase: res.data.test_case,
          scored: res.data.scored
        })
      if (res.data.test_case === null) {
        setHistoryId('None')
      } else {
        setHistoryId(res.data.test_case)
      }
      setInitial(res.data.initial_schematic)
    }).catch(err => {
      console.log(err)
      api.get(`save/${url.id}`, config).then(res => {
        console.log(res.data)
        setLTIDetails(
          {
            modelSchematic: res.data,
            scored: true
          })
      })
    })
    api.get(`simulation/history/${url.id}/${null}`, config).then(res => {
      res.data.map(ele => {
        ele.simulation_time = new Date(ele.simulation_time)
        return 0
      })
      setHistory(res.data)
    }).catch(err => {
      console.log(err)
    })
  }, [])

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
      model_schematic: ltiDetails.modelSchematic.save_id,
      score: score,
      initial_schematic: ltiDetails.initialSchematic,
      test_case: ltiDetails.testCase,
      scored: ltiDetails.scored
    }
    console.log(body)
    api.post('lti/build/', body)
      .then(res => {
        setLTIDetails({
          ...ltiDetails,
          configURL: res.data.config_url,
          configExists: true,
          consumerError: '',
          score: res.data.score
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
    api.delete(`lti/delete/${ltiDetails.modelSchematic.save_id}`)
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
          testCase: null
        })
        setHistoryId('')
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
      if (element.save_id === e.target.value) {
        schematic = element
      }
    })
    setInitial(schematic)
    setLTIDetails({ ...ltiDetails, initialSchematic: e.target.value })
  }

  const handleChangeSim = (e) => {
    if (e.target.value === 'None') {
      console.log('in if')
      setLTIDetails({ ...ltiDetails, testCase: null })
    } else {
      setLTIDetails({ ...ltiDetails, testCase: e.target.value })
    }
    setHistoryId(e.target.value)
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
      model_schematic: ltiDetails.modelSchematic.save_id,
      score: score,
      initial_schematic: ltiDetails.initialSchematic,
      test_case: ltiDetails.testCase,
      scored: ltiDetails.scored
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
    var copyText = document.querySelector(".lti-url")
    console.log(copyText)
    copyText.select()
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy")
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
                title="Model Schematic"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  Model Schematic
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          {ltiDetails.initialSchematic && <Card className={classes.root} style={{ marginLeft: '2%' }}>
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
          </Card>}
        </div>
        <div style={{ minWidth: '500px', marginLeft: '2%', marginTop: '2%' }}>
          {ltiDetails.consumerError && <h3>{ltiDetails.consumerError}</h3>}
          <TextField id="standard-basic" label="Consumer Key" defaultValue={consumerKey} onChange={handleConsumerKey} value={consumerKey} disabled={configExists} variant="outlined" />
          <TextField style={{ marginLeft: '1%' }} id="standard-basic" label="Secret Key" defaultValue={secretKey} onChange={handleSecretKey} value={secretKey} variant="outlined" />
          <TextField style={{ marginLeft: '1%' }} id="standard-basic" label="Score" defaultValue={score} onChange={handleScore} value={score} disabled={!ltiDetails.scored} variant="outlined" />
          <FormControl variant="outlined" style={{ marginLeft: '1%' }} className={classes.formControl}>
            <InputLabel htmlFor="outlined-age-native-simple">Student Schematic</InputLabel>
            <Select
              labelId="demo-simple-select-placeholder-label-label"
              id="demo-simple-select-placeholder-label"
              value={ltiDetails.initialSchematic}
              style={{ minWidth: '300px' }}
              onChange={handleChange}
              label="Student Schematic"
              className={classes.selectEmpty}
            >
              {schematics.map(schematic => {
                return <MenuItem key={schematic.save_id} value={schematic.save_id}>{schematic.name}</MenuItem>
              })}
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ marginLeft: '1%' }} className={classes.formControl}>
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
              <MenuItem value="None">
                None
              </MenuItem>
              {history.map(sim => {
                return <MenuItem key={sim.id} value={sim.id}>{sim.simulation_type} at {sim.simulation_time.toUTCString()}</MenuItem>
              })}
            </Select>}
          </FormControl>
          <FormControlLabel
            style={{ marginLeft: '1%' }}
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
          <br />
          <Button style={{ marginTop: '1%' }} disableElevation variant="contained" color="primary" href='/eda/#/dashboard' startIcon={<ArrowBackIcon />}>
            Return to Dashboard
          </Button>
          <Button style={{ marginTop: '1%', marginLeft: '1%' }} disableElevation variant="contained" color="primary" disabled={configExists} onClick={handleLTIGenerate}>
            Create LTI URL
          </Button>
          {configExists &&
            <Button
              style={{ marginLeft: '1%', marginTop: '1%' }}
              disableElevation
              variant="contained"
              className={classes.delete}
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteLTIApp()}
            >
              Delete
            </Button>}
          {configExists &&
            <Button
              style={{ marginLeft: '1%', marginTop: '1%' }}
              disableElevation
              color="primary"
              variant="contained"
              href={`#/submission?consumer_key=${ltiDetails.consumerKey}`}
            >
              Submissions
            </Button>}
          {configExists && <Button
            style={{ marginLeft: '1%', marginTop: '1%' }}
            disableElevation
            color="primary"
            variant="contained"
            onClick={handleOnClick} >
            Update LTI App
          </Button>}
          {configURL && <div style={{ display: 'flex', marginTop: '1%' }}>
            <h3 className={classes.config} style={{ float: 'left' }}>URL for LTI Access:</h3>
            <h3 className={classes.config} style={{ float: 'left' }}>
              <TextareaAutosize className="lti-url" value={configURL} maxRows={1} style={{ fontSize: '14px', minWidth: 580, width: 580, maxWidth: 580, border: 'none', backgroundColor: '#f4f6f8' }} />
            </h3>
            <Button style={{ float: 'right', height: '50%', marginTop: '0.7%', marginLeft: '1%' }} disableElevation variant="contained" color="primary" onClick={handleUrlCopy}>
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
