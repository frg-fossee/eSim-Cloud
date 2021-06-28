/* eslint-disable react/no-unescaped-entities */
import React, { useEffect } from 'react'
import { Tab, Box, Tabs, AppBar, Typography, Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

import SchematicCard from './SchematicCard'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSchematics } from '../../redux/actions/index'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper
  }
}))

function TabPanel (props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
}

function a11yProps (index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`
  }
}

export default function ProgressPanel ({ ltiDetails = null }) {
  const classes = useStyles()
  const [value, setValue] = React.useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const schematics = useSelector(state => state.dashboardReducer.schematics)

  const dispatch = useDispatch()

  // For Fetching Saved Schematics
  useEffect(() => {
    dispatch(fetchSchematics())
  }, [dispatch])

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          <Tab label="Recent Schematics" {...a11yProps(0)} />
          {/* <Tab label="Under Reviewer" {...a11yProps(1)} />
          <Tab label="Under Domain Expert" {...a11yProps(2)} /> */}
        </Tabs>
      </AppBar>

      {/* Display overview of recently 4 saved schematics */}
      <TabPanel value={value} index={0}>
        {schematics.length !== 0
          ? <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            alignContent="center"
            spacing={3}
          >
            {schematics.slice(0, 4).map(
              (sch) => {
                var actual = null
                var flag = null
                ltiDetails.map(
                  // eslint-disable-next-line
                  (lti) => {
                    if (lti.model_schematic === sch.save_id || lti.initial_schematic === sch.save_id) {
                      flag = 1
                      actual = lti.consumer_key
                      // eslint-disable-next-line
                      return
                    }
                  }
                )
                if (flag) {
                  return (
                    <Grid item xs={12} sm={6} lg={3} key={sch.save_id}>
                      <SchematicCard sch={sch} consKey={actual} />
                    </Grid>
                  )
                } else {
                  return (
                    <Grid item xs={12} sm={6} lg={3} key={sch.save_id}>
                      <SchematicCard sch={sch} />
                    </Grid>
                  )
                }
                // return (
                //   <Grid item xs={12} sm={6} lg={3} key={sch.save_id}>
                //     <SchematicCard sch={sch} />
                //   </Grid>
                // )
              }
            )}
          </Grid>
          : <Typography variant="button" display="block" gutterBottom>
            You have not created any schematic , Create your first one now...
          </Typography>
        }
      </TabPanel>

      {/* Listing Schematics Under Review */}
      {/* <TabPanel value={value} index={1}>
        <Typography variant="button" display="block" gutterBottom>
          Start publishing circuit , You don't have any schematics under review...
        </Typography>
      </TabPanel> */}

      {/* Listing Reviewed Schematics */}
      {/* <TabPanel value={value} index={2}>
        <Typography variant="button" display="block" gutterBottom>
          Start publishing circuit , You don't have any schematics to be tagged by
          domain expert...
        </Typography>
      </TabPanel> */}
    </div>
  )
}

ProgressPanel.propTypes = {
  ltiDetails: PropTypes.string
}
