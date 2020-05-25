import React from 'react'
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

import index from '../../static/index.png'

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

export default function SchCard (props) {
  const classes = useStyles()

  return (
    <>
      {/* User Schematic Overview Card */}
      <Card>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={index}
            title="Contemplative Reptile"
          />

          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              RC Circuit
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              An RC circuit is a circuit with both a resistor (R) and a
              capacitor (C). RC circuits are freqent element in electronic
              devices.
            </Typography>
            <Rating
              name="half-rating-read"
              defaultValue={2.5}
              precision={0.5}
              className={classes.rating}
              readOnly
            />
          </CardContent>
        </CardActionArea>

        <CardActions>
          <Button
            target="_blank"
            component={RouterLink}
            to="/editor"
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
