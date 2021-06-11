import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Typography,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  CardHeader,
  Tooltip,
  Snackbar,
  Dialog,
  DialogContent,
  TextField,
  DialogTitle,
  Paper
} from '@material-ui/core'
import ShareIcon from '@material-ui/icons/Share'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'
import DeleteIcon from '@material-ui/icons/Delete'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import ScreenShareIcon from '@material-ui/icons/ScreenShare'
import { deleteSchematic } from '../../redux/actions/index'
import MuiAlert from '@material-ui/lab/Alert'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSchematics } from '../../redux/actions/index'
import api from '../../utils/Api'

const useStyles = makeStyles((theme) => ({
  media: {
    height: 0,
    paddingTop: '56.25%' // 16:9
  },
  rating: {
    marginTop: theme.spacing(1),
    marginLeft: 'auto'
  },
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  },
  config: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1)
  },
  delete: {
    backgroundColor: 'red',
    color: 'white'
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 150,
  }
}))
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

// Schematic delete snackbar
function SimpleSnackbar({ open, close, sch }) {
  const dispatch = useDispatch()

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      open={open}
      autoHideDuration={6000}
      onClose={close}
    >
      <Alert icon={false} severity="warning" color="error" style={{ width: '100%' }} action={
        <>
          <Button size="small" aria-label="close" color="inherit" onClick={() => { dispatch(deleteSchematic(sch.save_id)) }}>
            Yes
          </Button>
          <Button size="small" aria-label="close" color="inherit" onClick={close}>
            NO
          </Button>
        </>
      }
      >
        {'Delete ' + sch.name + ' ?'}
      </Alert>
    </Snackbar>
  )
}

SimpleSnackbar.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  sch: PropTypes.object
}

// Display schematic updated status (e.g : updated 2 hours ago...)
function timeSince(jsonDate) {
  var json = jsonDate

  var date = new Date(json)

  var seconds = Math.floor((new Date() - date) / 1000)

  var interval = Math.floor(seconds / 31536000)

  if (interval > 1) {
    return interval + ' years'
  }
  interval = Math.floor(seconds / 2592000)
  if (interval > 1) {
    return interval + ' months'
  }
  interval = Math.floor(seconds / 86400)
  if (interval > 1) {
    return interval + ' days'
  }
  interval = Math.floor(seconds / 3600)
  if (interval > 1) {
    return interval + ' hours'
  }
  interval = Math.floor(seconds / 60)
  if (interval > 1) {
    return interval + ' minutes'
  }
  return Math.floor(seconds) + ' seconds'
}

// Display schematic created date (e.g : Created On 29 Jun 2020)
function getDate(jsonDate) {
  var json = jsonDate
  var date = new Date(json)
  const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' })
  const [{ value: month }, , { value: day }, , { value: year }] = dateTimeFormat.formatToParts(date)
  return `${day}-${month}-${year}`
}

// Card displaying overview of onCloud saved schematic.
export default function SchematicCard({ sch, consKey=null }) {
  const classes = useStyles()
  const schematics = useSelector(state => state.dashboardReducer.schematics)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchSchematics())
  }, [dispatch])

  useEffect(() => {
    setLTIDetails({ ...ltiDetails, consumerKey: consKey })
    //eslint-disable-next-line
  }, [])
  // To handle LTI details
  const [ltiDetails, setLTIDetails] = React.useState({
    secretKey: '',
    consumerKey: '',
    configURL: '',
    configExists: false,
    consumerError: '',
    score: '',
    studentSchematic: ''
  })
  const { secretKey, consumerKey, configURL, configExists, consumerError, score } = ltiDetails

  // To handle delete schematic snackbar
  const [snacOpen, setSnacOpen] = React.useState(false)

  // To handle sharing of circuit as a LTI producer
  const [ltiModal, setLTIModal] = React.useState(false)
  const handleSnacClick = () => {
    setSnacOpen(true)
  }

  const handleChange = (e) => {
    setLTIDetails({ ...ltiDetails, studentSchematic: e.target.value })
  }
  // Api call for getting LTI config url for specified circuit by passing consumer key and secret key
  // eslint-disable-next-line
  const handleLTIGenerate = (consumer_key, secret_key, save_id, score) => {
    const body = {
      consumer_key: consumer_key,
      secret_key: secret_key,
      model_schematic: save_id,
      score: score,
      initial_schematic: ltiDetails['studentSchematic']
    }
    console.log(body)
    api.post('lti/build/', body)
      .then(res => {
        setLTIDetails({
          ...ltiDetails,
          configURL: res.data.config_url,
          configExists: true,
          consumerError: false,
          score: res.data.score
        })
        return res.data
      })
      .catch((err) => {
        console.log(err.data)
        setLTIDetails({ ...ltiDetails, consumerError: 'An error was encountered while setting the details!' })
      })
  }
  const handleOpenLTI = () => {
    setLTIModal(true)
    api.get(`lti/exist/${sch.save_id}`)
      .then(res => {
        if (res.data.secret_key) {
          setLTIDetails(
            {
              secretKey: res.data.secret_key,
              consumerKey: res.data.consumer_key,
              configURL: res.data.config_url,
              score: res.data.score,
              configExists: true,
              studentSchematic: res.data.initial_schematic
            })
        }
      }).catch(err => console.log(err))
  }
  const handleDeleteLTIApp = () => {
    api.delete(`lti/delete/${sch.save_id}`)
      .then(res => {
        setLTIDetails({
          secretKey: '',
          consumerKey: '',
          configURL: '',
          configExists: false,
          consumerError: false,
          score: '',
          studentSchematic: ''
        })
      })
      .catch(error => console.log(error))
  }
  const handleCloseLTI = () => {
    setLTIModal(false)
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

  const handleSnacClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnacOpen(false)
  }

  return (
    <>
      {/* User saved Schematic Overview Card */}
      <Card>
        <CardActionArea>
          <CardHeader
            title={sch.name}
            subheader={'Created On ' + getDate(sch.create_time)} /* Display created date */
          />
          <CardMedia
            className={classes.media}
            image={sch.base64_image}
            title={sch.name}
          />
          <CardContent>
            <Typography variant="body2" component="p">
              {sch.description}
            </Typography>
            {/* Display updated status */}
            <Typography variant="body2" color="textSecondary" component="p" style={{ margin: '5px 0px 0px 0px' }}>
              Updated {timeSince(sch.save_time)} ago...
            </Typography>
          </CardContent>
        </CardActionArea>

        <CardActions>
          <Button
            target="_blank"
            component={RouterLink}
            to={consumerKey ? `/editor?id=${sch.save_id}&consumer_key=${consumerKey}` : `/editor?id=${sch.save_id}` }
            size="small"
            color="primary"
          >
            Launch in Editor
          </Button>
        {/* Display create LTI app option */}
        <Tooltip title='Create LTI app' placement="bottom" arrow>
          <ScreenShareIcon
            color='secondary'
            fontSize="small"
            style={{ marginLeft: 'auto' }}
            onClick={() => { handleOpenLTI() }}
          />
        </Tooltip>
        <Dialog onClose={handleCloseLTI} aria-labelledby="simple-dialog-title" open={ltiModal}>
          <DialogTitle id="simple-dialog-title">Share circuit to LMS</DialogTitle>
          <DialogContent>
            <Typography variant="overline" display="block" gutterBottom>
              {consumerError}
            </Typography>
            <TextField id="standard-basic" label="Consumer Key" defaultValue={consumerKey} onChange={handleConsumerKey} value={consumerKey} disabled={configExists} />
            <TextField style={{ marginLeft: '10px' }} id="standard-basic" label="Secret Key" defaultValue={secretKey} onChange={handleSecretKey} value={secretKey} disabled={configExists} />
            <TextField style={{ marginTop: '10px' }} id="standard-basic" label="Score" defaultValue={score} onChange={handleScore} value={score} disabled={configExists} />
            <FormControl className={classes.formControl}>
              <InputLabel shrink id="demo-simple-select-placeholder-label-label">
                Student Schematic
                </InputLabel>
              <Select
                labelId="demo-simple-select-placeholder-label-label"
                id="demo-simple-select-placeholder-label"
                value={ltiDetails['studentSchematic']}
                onChange={handleChange}
                displayEmpty
                className={classes.selectEmpty}
                inputProps={{ readOnly: configExists }}
              >
                {schematics.map(schematic => {
                  return <MenuItem value={schematic.save_id}>{schematic.name}</MenuItem>
                })}
              </Select>
            </FormControl>
            {configURL && <Paper><div className={classes.config}>{configURL}</div></Paper>}
            <Button style={{ marginTop: '25px', marginBottom: '10px' }} variant="contained" color="primary" disabled={configExists} onClick={() => handleLTIGenerate(consumerKey, secretKey, sch.save_id, score)}>
              Generate LTI config URL
              </Button>
            {configExists &&
              <Button
                style={{ marginTop: '25px', marginBottom: '10px', marginLeft: '5px' }}
                variant="contained"
                className={classes.delete}
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteLTIApp()}
              >
                Delete
                </Button>}
            {configExists &&
              <Button
                style={{ marginTop: '25px', marginBottom: '10px', marginLeft: '5px' }}
                disableElevation
                color="primary"
                variant="contained"
                href={`#/submission?consumer_key=${ltiDetails.consumerKey}`}
              >
                Submissions
                </Button>}

          </DialogContent>
        </Dialog>
        {/* Display delete option */}
        <Tooltip title='Delete' placement="bottom" arrow>
          <DeleteIcon
            color='secondary'
            fontSize="small"
            onClick={() => { handleSnacClick() }}
          />
        </Tooltip>
        <SimpleSnackbar open={snacOpen} close={handleSnacClose} sch={sch} />

        {/* Display share status */}
        <Tooltip title={!sch.shared ? 'SHARE OFF' : 'SHARE ON'} placement="bottom" arrow>
          <ShareIcon
            color={!sch.shared ? 'disabled' : 'primary'}
            fontSize="small"
            style={{ marginRight: '10px' }}
          />
        </Tooltip>
        </CardActions>
    </Card>
    </>
  )
}

SchematicCard.propTypes = {
  sch: PropTypes.object
}
