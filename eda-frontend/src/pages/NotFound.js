import React from 'react'

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  header: {
    padding: theme.spacing(8, 0, 6),
  },
}));

export default function NotFound() {
  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.header}>
      <Typography variant="h1" align="center" gutterBottom>
        404 Not Found
      </Typography>
      <Typography variant="h4" align="center" color="textSecondary" gutterBottom>
        Sorry, Requested page not found
      </Typography>
    </Container>
  )
}
