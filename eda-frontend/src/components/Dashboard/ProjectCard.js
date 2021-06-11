import {
  Button,
  ButtonBase,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Typography,
} from '@material-ui/core'
import React,{useEffect} from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'
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
export default function ProjectCard({ pub, is_review }) {
  useEffect(() => {
    console.log(pub)
  }, [])
  const classes = useStyles()
  return (
    <>
      <Card>
      <ButtonBase
            target="_blank"
            component={RouterLink}
            to={'/project?save_id=' + pub.save_id + '&version=' + pub.active_version + '&branch=' + pub.active_branch + '&project_id=' + pub.project_id}
            style={{width:'100%'}}>
        <CardActionArea>
          <CardHeader title={pub.title} />
          <CardMedia
            className={classes.media}
            image={pub.saves[0].base64_image} />
          <CardContent>
          <Typography variant="body2" component="p" noWrap={true}>
              {pub.description}
            </Typography>
            <br/>
            <Typography variant='body2' color='textSecondary' component='p'>
              Status: {pub.status_name}
            </Typography>
            <Typography variant='body2' component='p' color='textSecondary' style={{ margin: '5px 0px 0px 0px' }}>
              Updated at {timeSince(pub.save_time)} ago...
            </Typography>
          </CardContent>
        </CardActionArea>
        </ButtonBase>
        {!is_review &&<CardActions>
          
            <Button
              target="_blank"
              component={RouterLink}
              to={'/editor?id=' + pub.save_id}
              size="small"
              color="primary">
              Edit
        </Button>
        </CardActions>}
      </Card>
    </>
  )
}
ProjectCard.propTypes = {
  sch: PropTypes.object
}