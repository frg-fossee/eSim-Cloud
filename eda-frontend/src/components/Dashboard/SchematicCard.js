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
  ButtonBase,
  Chip
} from '@material-ui/core'
import ShareIcon from '@material-ui/icons/Share'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'
import DeleteIcon from '@material-ui/icons/Delete'
import { deleteSchematic } from '../../redux/actions/index'
import ReportProblemIcon from '@material-ui/icons/ReportProblem'
import SimpleSnackbar from '../Shared/Snackbar'

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

// Display schematic updated status (e.g : updated 2 hours ago...)
function timeSince (jsonDate) {
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
function getDate (jsonDate) {
  var json = jsonDate
  var date = new Date(json)
  const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' })
  const [{ value: month }, , { value: day }, , { value: year }] = dateTimeFormat.formatToParts(date)
  return `${day}-${month}-${year}`
}

// Card displaying overview of onCloud saved schematic.
export default function SchematicCard ({ sch }) {
  const classes = useStyles()

  // To handel delete schematic snackbar
  const [snacOpen, setSnacOpen] = React.useState(false)

  const handleSnacClick = () => {
    setSnacOpen(true)
  }
  const handleSnacClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnacOpen(false)
  }
  const clickViewProject = () => {
    const win = window.open()
    win.location.href = '/eda/#/project?save_id=' + sch.save_id + '&version=' + sch.project_version + '&branch=' + sch.project_branch + '&project_id=' + sch.project_id
    win.focus()
  }

  return (
    <>
      {/* User saved Schematic Overview Card */}

      <Card>
        <ButtonBase
          target="_blank"
          component={RouterLink}
          to={'/editor?id=' + sch.save_id + '&version=' + sch.version + '&branch=' + sch.branch}
          style={{ width: '100%' }}
        >
          <CardActionArea>
            <CardHeader
              title={sch.name}
              subheader={'Created On ' + getDate(sch.create_time)}
              action={sch.project_id && sch.is_reported === true && <Tooltip title='Project is reported!' arrow><ReportProblemIcon style={{ color: 'red' }} /></Tooltip>}
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

              </Typography>
            </CardContent>
          </CardActionArea>
        </ButtonBase>
        <CardActions>
          <Chip color='primary' variant='outlined' label={`Updated ${timeSince(sch.save_time)} ago...`} />
          {sch.project_id && <Chip variant='outlined' clickable={true} onClick={clickViewProject} label='Project' />}
          {/* Display delete option */}
          {!sch.project_id && 
          <Button>
          <Tooltip title="Delete" placement="bottom" arrow>
            <DeleteIcon
              color="secondary"
              fontSize="small"
              // style={{ marginLeft: 'auto' }}
              onClick={() => { handleSnacClick() }}
            />
          </Tooltip>
          </Button>}
          <SimpleSnackbar open={snacOpen} close={handleSnacClose} sch={sch} confirmation={deleteSchematic} />

          {/* Display share status */}
          <Tooltip
            title={!sch.shared ? 'SHARE OFF' : 'SHARE ON'}
            placement="bottom"
            arrow
          >
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
  createCircuit: PropTypes.func
}
