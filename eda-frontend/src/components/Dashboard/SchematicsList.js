import React from 'react'
import {
  Card,
  Grid,
  Button,
  Typography,
  CardActions,
  CardContent
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'

import SchematicCard from './SchematicCard'

const useStyles = makeStyles({
  mainHead: {
    width: '100%',
    backgroundColor: '#404040',
    color: '#fff'
  },
  title: {
    fontSize: 14,
    color: '#80ff80'
  }
})

function MainCard () {
  const classes = useStyles()

  return (
    <Card className={classes.mainHead}>
      <CardContent>
        <Typography className={classes.title} gutterBottom>
          All schematics are Listed Below
        </Typography>
        <Typography variant="h5" component="h2">
          My Schematics
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          target="_blank"
          component={RouterLink}
          to="/editor"
          size="small"
          color="primary"
        >
          Create New
        </Button>
        <Button size="small" color="secondary">
          Load More
        </Button>
      </CardActions>
    </Card>
  )
}

export default function SchematicsList () {
  return (
    <>
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        alignContent="center"
        spacing={3}
      >
        {/* User Dashboard My Schematic Header */}
        <Grid item xs={12}>
          <MainCard />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <SchematicCard />
        </Grid>
      </Grid>
    </>
  )
}
