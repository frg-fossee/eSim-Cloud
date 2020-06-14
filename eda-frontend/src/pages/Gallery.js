import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Card,
  Grid,
  Button,
  Typography,
  CardActions,
  CardContent,
  Container,
  CssBaseline,
  CardActionArea,
  CardMedia
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'
import GallerySchSample from '../utils/GallerySchSample'

const useStyles = makeStyles((theme) => ({
  mainHead: {
    width: '100%',
    backgroundColor: '#404040',
    color: '#fff'
  },
  title: {
    fontSize: 18,
    color: '#80ff80'
  },
  header: {
    padding: theme.spacing(5, 0, 6, 0)
  },
  root: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f4f6f8'
  },
  media: {
    marginTop: theme.spacing(3),
    height: 170
  }
}))

var images = require.context('../static/gallery', true)

function SchematicCard ({ sch }) {
  const classes = useStyles()

  useEffect(() => {
    document.title = 'Gallery - eSim '
  })

  const imageName = images('./' + sch.media)

  return (
    <>
      {/* Gallery Schematic Overview Card */}
      <Card>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={imageName}
            title={sch.name}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {sch.name}
            </Typography>
            <Typography variant="body2" component="p">
              {sch.description}
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
        </CardActions>
      </Card>
    </>
  )
}
SchematicCard.propTypes = {
  sch: PropTypes.object
}

function MainCard () {
  const classes = useStyles()

  return (
    <Card className={classes.mainHead}>
      <CardContent>
        <Typography variant="h2" align="center" gutterBottom>
        eSim Gallery
        </Typography>
        <Typography className={classes.title} align="center" gutterBottom>
        Sample schematics are listed below...
        </Typography>
      </CardContent>
    </Card>
  )
}

export default function Gallery () {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Container maxWidth="lg" className={classes.header}>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
          alignContent="center"
          spacing={3}
        >
          {/* eSim Gallery Header */}
          <Grid item xs={12}>
            <MainCard />
          </Grid>

          {/* Listing Gallery Schematics */}
          {GallerySchSample.map(
            (sch) => {
              return (
                <Grid item xs={12} sm={6} lg={4} key={sch.save_id}>
                  <SchematicCard sch={sch} />
                </Grid>
              )
            }
          )}

        </Grid>
      </Container>
    </div>
  )
}
