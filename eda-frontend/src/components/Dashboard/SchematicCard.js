import React from 'react'
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
  DialogActions,
  DialogContent,
  TextField,
  DialogContentText,
  DialogTitle,
  Paper,
} from '@material-ui/core'
import ShareIcon from '@material-ui/icons/Share'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'
import DeleteIcon from '@material-ui/icons/Delete'
import PublishIcon from '@material-ui/icons/Publish';
import { useDispatch } from 'react-redux'
import {  deleteSchematic } from '../../redux/actions/index'
import MuiAlert from '@material-ui/lab/Alert'
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
  no: {
    color: 'red',
    marginLeft: '10px'
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
export default function SchematicCard({ sch,createCircuit }) {
  const classes = useStyles()

  // To handel delete schematic snackbar
  const [snacOpen, setSnacOpen] = React.useState(false)
  const [publishModal, setPublishModal] = React.useState(false)
  const [hasCircuit,setHasCircuit] = React.useState(sch.circuit)

  const handlePublishClick = () => {
    setPublishModal(!publishModal)
    
  }
  const createSchCircuit = (save_id) => {
    // Get token from localstorage
    const token = localStorage.getItem("esim_token")
  
    // add headers
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  
    // If token available add to headers
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    api.post(`/publish/create/${save_id}`, {}, config)
      .then(
        () => {
          setHasCircuit(true)
        }
      )
      .catch((err) => { console.error(err) })
  }
  const handleSnacClick = () => {
    setSnacOpen(true)
  }
  const makePublish = () => {
    handlePublishClick()
    createSchCircuit(sch.save_id)

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
            to={'/editor?id=' + sch.save_id}
            size="small"
            color="primary"
          >
            Launch in Editor
          </Button>
          {!hasCircuit &&
            <Tooltip title="Publish" placement="bottom" arrow>
              <PublishIcon
                color='secondary'
                fontSize='small'
                style={{ marginLeft: 'auto' }}
                onClick={() => { handlePublishClick() }}
              />
            </Tooltip>
          }
          {!sch.circuit &&
            <Dialog onClose={handlePublishClick} aria-labelledby="simple-dialog-title" open={publishModal}>
              <DialogTitle id="simple-dialog-title">Do you want to publish this circuit?</DialogTitle>
              <DialogActions>
                <Typography>Note: The circuit will be reviewed first and then will be published.</Typography>
                <br />
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  onClick={makePublish}
                >
                  Yes
                </Button>
                <Button
                  size="small"
                  className={classes.no}
                  variant="contained"
                  onClick={handlePublishClick}
                >
                  No
                </Button>
              </DialogActions>
            </Dialog>}

          {/* Display delete option */}
          <Tooltip title='Delete' placement="bottom" arrow>
            <DeleteIcon
              color='secondary'
              fontSize="small"
              // style={{ marginLeft: 'auto' }}
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
  sch: PropTypes.object,
  createCircuit: PropTypes.func,
}
