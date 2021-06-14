/* eslint-disable camelcase */
import {
  Button,
  ButtonBase,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Typography
} from '@material-ui/core'
import React from 'react'
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

export default function ProjectCard ({ pub, is_review }) {
  const classes = useStyles()
  return (
    <>
      <Card>
        <ButtonBase
          target="_blank"
          component={RouterLink}
          to={'/project?save_id=' + pub.save_id + '&version=' + pub.active_version + '&branch=' + pub.active_branch + '&project_id=' + pub.project_id}
          style={{ width: '100%' }}>
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
              {/* <Typography variant='body2' component='p' color='textSecondary' style={{ margin: '5px 0px 0px 0px' }}>
              Updated at {timeSince(pub.save_time)} ago...
            </Typography> */}
            </CardContent>
          </CardActionArea>
        </ButtonBase>
        {!is_review && <CardActions>

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
  pub: PropTypes.object,
  is_review: PropTypes.bool
}
