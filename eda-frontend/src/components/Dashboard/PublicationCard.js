import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Typography,
  Dialog,
  Select,
  DialogContent,
  MenuItem,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Paper,
  Menu,
  DialogActions,
} from '@material-ui/core'
import React ,{useEffect}from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'
import SettingsIcon from '@material-ui/icons/Settings';
import api from '../../utils/Api'
import {useDispatch,useSelector } from 'react-redux'
import { getStatus } from '../../redux/actions'

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


export default function PublicationCard({ pub }) {
  const dispatch = useDispatch()
  const [publishModal, setPublishModal] = React.useState(false)
  const stateList = useSelector(state => state.publicationReducer.states)

  const [status, setStatus] = React.useState(null)
  useEffect(() => {
    //no code
  }, [dispatch])
  const handlePublishClick = () => {
    if (publishModal === false) {
      dispatch(getStatus(pub.publication_id))
    }
    setPublishModal(!publishModal)
  }
  const changeStatus = () => {
    //post the state
    const token = localStorage.getItem("esim_token")

    // add headers
    const config = {
      headers: {
        'Content-Type': 'application/json'
      },
    }

    // If token available add to headers
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    api.post(`/workflow/state/${pub.publication_id}`,
      {
        'name': status
      }, config)
      .then((res) => {
        console.log(res.data)
        pub.status_name = res.data.name
      })
      .catch(error => console.log(error))
    handlePublishClick()
  }
  const handleSelectChange = (event) => {
    setStatus(event.target.value)
  };
  const classes = useStyles()
  return (
    <>
      <Card>
        <CardActionArea>
          <CardHeader title={pub.title} />
          <CardMedia
            className={classes.media}
            image={pub.base64_image} />
          <CardContent>
            <Typography variant='body2' component='p'>
              Status: {pub.status_name}
            </Typography>
            <Typography variant='body2' component='p' color='textSecondary' style={{ margin: '5px 0px 0px 0px' }}>
              Updated at {pub.save_time}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button
            target="_blank"
            component={RouterLink}
            to={'/editor?id=' + pub.save_id}
            size="small"
            color="primary">
            Launch in Editor
          </Button>
          <Button
            target="_blank"
            component={RouterLink}
            to={'/publication?save_id=' + pub.save_id + '&publication_id=' + pub.publication_id}
            size="small"
            color="primary">
            View Publication
          </Button>
          <Tooltip title="Publication Settings" placement="bottom" arrow>
            <SettingsIcon
              color='secondary'
              fontSize='small'
              onClick={() => { handlePublishClick() }}
            />
          </Tooltip>
        </CardActions>

        <Dialog onClose={handlePublishClick} aria-labelledby="simple-dialog-title" open={publishModal}>
          <DialogTitle id="simple-dialog-title">Publication Status: {pub.status_name}</DialogTitle>
          <DialogContent>
            {stateList ?
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                autoWidth
                style={{ width: '50%' }}
                onChange={handleSelectChange}
                value={status}
              >
                {stateList.map((item, index) =>
                (
                  <MenuItem value={item}>{item}</MenuItem>
                ))}
              </Select> :
              <h3>Wait for your publication to be reviewed</h3>}
            <br />
          </DialogContent>
          {stateList ? <DialogActions>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={changeStatus}
            >
              Change
            </Button>
            <Button
              onClick={handlePublishClick}
              size="small"
              className={classes.no}
              variant="contained"
            >
              Cancel
            </Button>
          </DialogActions> :
            <DialogActions>
              <Button
                onClick={handlePublishClick}
                size="small"
                variant="contained"
              >
                OK
          </Button>
            </DialogActions>}
        </Dialog>



      </Card>
    </>
  )
}
PublicationCard.propTypes = {
  sch: PropTypes.object
}