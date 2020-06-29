// Page to display Page Not Found (i.e. 404) error.
import React, { useEffect } from 'react'

import { Container, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  header: {
    padding: theme.spacing(8, 0, 6)
  }
}))

export default function NotFound () {
  const classes = useStyles()

  useEffect(() => {
    document.title = 'Not Found - EDA '
  })

  return (
    <Container maxWidth="lg" className={classes.header}>
      <Typography variant="h1" align="center" gutterBottom>
        404 Not Found
      </Typography>
      <Typography
        variant="h4"
        align="center"
        color="textSecondary"
        gutterBottom
      >
        Sorry, Requested page not found
      </Typography>
    </Container>
  )
}
