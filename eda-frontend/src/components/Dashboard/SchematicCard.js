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
  Tooltip
} from '@material-ui/core'
import ShareIcon from '@material-ui/icons/Share'
import GetAppRoundedIcon from '@material-ui/icons/GetAppRounded'
import { makeStyles } from '@material-ui/core/styles'
import Rating from '@material-ui/lab/Rating'
import { Link as RouterLink } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
  media: {
    marginTop: theme.spacing(3),
    height: 150
  },
  rating: {
    marginTop: theme.spacing(1),
    marginLeft: 'auto'
  }
}))

export default function SchematicCard ({ sch }) {
  const classes = useStyles()

  return (
    <>
      {/* User Schematic Overview Card */}
      <Card>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={sch.base64_image}
            title={sch.name}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {sch.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {sch.description}
            </Typography>
            <Rating
              name="half-rating-read"
              defaultValue={Math.floor((Math.random() * 5) + 1)}
              precision={1}
              className={classes.rating}
              readOnly
            />
          </CardContent>
        </CardActionArea>

        <CardActions>
          <Button
            target="_blank"
            component={RouterLink}
            to={'/editor/' + sch.save_id}
            size="small"
            color="primary"
          >
            Launch in Editor
          </Button>

          <Tooltip title="Download" placement="bottom" arrow>
            <GetAppRoundedIcon
              color="action"
              fontSize="small"
              style={{ marginLeft: 'auto' }}
            />
          </Tooltip>

          <Tooltip title="SHARE" placement="bottom" arrow>
            <ShareIcon
              color="action"
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
