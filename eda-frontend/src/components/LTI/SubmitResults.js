import React from 'react'
import {
  Paper,
  Dialog,
  Typography,
  Grid,
  Slide,
  AppBar,
  Toolbar,
  IconButton
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import CancelIcon from '@material-ui/icons/Cancel'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CloseIcon from '@material-ui/icons/Close'

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative'
  }
}))

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

function SubmitResults ({ show, setResults, results }) {
  const classes = useStyles()
  const showIcons = (item) => {
    if (
      results.comparison_result === 'Same Values' || results.comparison_result.same.includes(item)
    ) {
      return <CheckCircleIcon />
    } else {
      return <CancelIcon />
    }
  }
  return (
    <Dialog
      open={show}
      onClose={() => setResults(false)}
      TransitionComponent={Transition}
      fullScreen
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setResults(false)}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Grid container>
        <Grid item xs={6}>
          <h2>Teacher Values</h2>
        </Grid>
        <Grid item xs={results.expected ? 6 : 12}>
          {results.given && results.given.graph !== 'true' && (
            <>
              <h2>Your Submission Values: </h2>
              {results.given.data.map((ele) => (
                <Paper key={ele}>
                  <Typography>
                    {showIcons(ele[0])}
                    {ele[0]} : {ele[2]}
                  </Typography>
                </Paper>
              ))}
            </>
          )}
        </Grid>
        <h3>Your Score: {results.score}</h3>
      </Grid>
    </Dialog>
  )
}

export default SubmitResults

SubmitResults.propTypes = {
  show: PropTypes.bool,
  setResults: PropTypes.func,
  results: PropTypes.object
}
