import React from 'react'
import {
  Paper,
  Dialog,
  Typography,
  Grid,
  Slide,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import CancelIcon from '@material-ui/icons/Cancel'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CloseIcon from '@material-ui/icons/Close'
import AdjustIcon from '@material-ui/icons/Adjust'
import CompareGraph from './CompareGraph'

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'left',
    backgroundColor: '#404040',
    color: '#fff'
  }
}))

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

function SubmitResults ({ show, setResults, results }) {
  console.log(results)
  const classes = useStyles()
  const showIcons = (item) => {
    if (results.sim_params.includes(item)) {
      if (
        results.comparison_result === 'Same Values' ||
        results.comparison_result.same.includes(item)
      ) {
        return <Tooltip title="Correct">
          <CheckCircleIcon />
        </Tooltip>
      } else {
        return <Tooltip title="Wrong">
          <CancelIcon />
        </Tooltip>
      }
    } else {
      return <Tooltip title="Not Graded">
        <AdjustIcon />
      </Tooltip>
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
        <Grid item xs={12}>
          <h1 style={{ textAlign: 'center' }}>Your Score: {results.score} /1 </h1>
          {/* <h2>Teacher Values</h2> */}
        </Grid>
        {results.expected && results.given.graph !== 'true' && (
          <>
            <Grid item xs={5} style={{ padding: '2%' }}>
              {// eslint-disable-next-line
              <h2>Teacher's values:</h2>}
              {results.expected.data.map((ele, index) => (
                <Paper class={classes.paper} key={ele}>
                  <Typography>
                    {index + 1}. {ele[0]} : {ele[2]}
                  </Typography>
                </Paper>
              ))}
            </Grid>
            <Grid item xs={2} />
          </>
        )}
        <Grid
          item
          xs={results.expected && results.given.graph !== 'true' ? 5 : 12}
          style={{ padding: '2%' }}
        >
          {results.given && results.given.graph !== 'true' ? (
            <>
              <h2>Your Submission Values: </h2>
              {results.given.data.map((ele, index) => (
                <Paper class={classes.paper} key={ele}>
                  <Typography style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}
                  >
                    {showIcons(ele[0])}
                    <p style={{ marginLeft: '2%' }}>{index + 1}. {ele[0]} : {ele[2]}</p>
                  </Typography>
                </Paper>
              ))}
            </>
          ) : (
            <CompareGraph expected={results.expected} given={results.given} />
          )}
        </Grid>
      </Grid>
    </Dialog >
  )
}

export default SubmitResults

SubmitResults.propTypes = {
  show: PropTypes.bool,
  setResults: PropTypes.func,
  results: PropTypes.object
}
