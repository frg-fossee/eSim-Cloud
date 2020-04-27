import React from 'react'

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles((theme) => ({
  header: {
    padding: theme.spacing(8, 0, 6),
  },
}));

export default function Home() {
  const classes = useStyles();

  return (
    <Container maxWidth="sm" component="main" className={classes.header}>
      <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
        EDA on Cloud
        </Typography>
      <Typography variant="h5" align="center" color="textSecondary" component="p">
        Online Circuit Simulator
        <br></br><br></br>
        <Button href="/editor" variant="contained" size="large" color="primary">
          Schematic Editor
        </Button>
      </Typography>
    </Container>
  )
}
