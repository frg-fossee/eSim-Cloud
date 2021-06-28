/* eslint-disable camelcase */
import React, { useEffect } from 'react'
import {
  Button,
  Typography,
  Dialog,
  DialogContent,
  MenuItem,
  Grid,
  Select,
  Paper,
  DialogActions,
  Tabs,
  Tab,
  Box
} from '@material-ui/core'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import { approveReports, fetchRole, getStatus, resolveReports } from '../../redux/actions/index'
import { useDispatch, useSelector } from 'react-redux'

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2)
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  }
})
function TabPanel (props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

function ReportComponent (props) {
  const [reportDetailsOpen, setReportDetailsOpen] = React.useState(false)
  const [status, setStatus] = React.useState(null)
  const [reportStatus, setReportStatus] = React.useState(null)
  const [tab, setTab] = React.useState(0)
  const auth = useSelector(state => state.authReducer)
  const stateList = useSelector(state => state.projectReducer.states)
  const dispatch = useDispatch()

  useEffect(() => {
    const query = new URLSearchParams(props.location.search)
    var project_id = query.get('project_id')
    dispatch(fetchRole())
    if (!reportDetailsOpen) {
      dispatch(getStatus(project_id))
    }
  }, [props.location.search, dispatch, reportDetailsOpen])

  const handleChangeTab = (event, newValue) => {
    setTab(newValue)
  }
  const handleSelectChange = (event) => {
    setStatus(event.target.value)
  }

  const handleReportDetailsOpen = (e) => {
    if (reportDetailsOpen) {
      setReportStatus(null)
    }
    setReportDetailsOpen(!reportDetailsOpen)
  }
  const onSelectReportStatus = (e, report_id) => {
    if (reportStatus) {
      var temp = [...reportStatus]
    } else {
      temp = []
    }
    var report = { id: report_id, approved: e.target.value }
    temp.push(report)
    setReportStatus(temp)
  }
  const onClick = (type) => {
    const query = new URLSearchParams(props.location.search)
    var project_id = query.get('project_id')
    switch (type) {
      case 'Change State':
        dispatch(approveReports(project_id, reportStatus, status))
        props.changedStatus()
        handleReportDetailsOpen()
        break
      default:
        break
    }
  }
  const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props
    return (
      <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    )
  })
  return (
    <>{auth.user && <Paper style={{ padding: '0.06% 1%' }}>

      <h3 style={{ color: 'red' }}>This is a reported project
        <Button style={{ float: 'right', verticalAlign: 'super' }} onClick={handleReportDetailsOpen}>View Reports</Button></h3>
      <Dialog
        open={reportDetailsOpen}
        onClose={(handleReportDetailsOpen)}
        fullWidth={true}
        maxWidth={'md'}>
        <DialogTitle style={{ paddingBottom: '0' }}><h1 style={{ marginBottom: '0', marginTop: '0' }}>Reports</h1></DialogTitle>
        <DialogContent>
          <Tabs value={tab} onChange={handleChangeTab}>
            <Tab label="Open Reports" {...a11yProps(0)} />
            <Tab label="Approved Reports" {...a11yProps(1)} />
            {auth.user.username !== props.project.details.author_name && auth.roles?.is_type_reviewer && <Tab label="Closed Reports" {...a11yProps(2)} />}
          </Tabs>
          <TabPanel value={tab} index={0}>
            {(props.project.reports.open[0] && auth.user.username !== props.project.details.author_name && auth.roles?.is_type_reviewer) && <h3 style={{ marginTop: '0' }}>Do you want to approve any reports?</h3>}
            {props.project.reports ? props.project.reports.open.map((item, index) => (
              <Paper key={index} style={{ margin: '1% .2%', padding: '.5% .7%' }}>
                <Grid container>
                  <Grid item xs={6}>
                    <p>
                      {item.description}
                    </p>
                  </Grid>
                  {auth.user.username !== props.project.details.author_name && auth.roles?.is_type_reviewer &&
                    <Grid item xs={6}>
                      <Select
                        defaultValue={item.approved}
                        variant='outlined'
                        style={{ float: 'right' }}
                        onChange={(e) => onSelectReportStatus(e, item.id)}
                      >
                        <MenuItem value={null}>None</MenuItem>
                        <MenuItem value={true}>Approve</MenuItem>
                        <MenuItem value={false}>Reject</MenuItem>
                      </Select>
                    </Grid>}
                </Grid>
              </Paper>
            )) : <>No Open Reports</>}
          </TabPanel>
          <TabPanel value={tab} index={1}>
            {props.project.reports.approved[0] ? props.project.reports.approved.map((item, index) => (
              <Paper key={index} style={{ margin: '1% .2%', padding: '.5% .7%' }}>
                <Grid container>
                  <Grid item xs={6}>
                    <p>
                      {item.description}
                    </p>
                  </Grid>
                  {auth.user.username !== props.project.details.author_name &&
                    <Grid item xs={6}>
                    </Grid>}
                </Grid>
              </Paper>
            )) : <>No Approved Reports</>}
          </TabPanel>
          {auth.user.username !== props.project.details.author_name && <TabPanel value={tab} index={2}>
            {props.project.reports && props.project.reports.closed.map((item, index) => (
              <Paper key={index} style={{ margin: '1% .2%', padding: '.5% .7%' }}>
                <Grid container>
                  <Grid item xs={6}>
                    <p>
                      {item.description}
                    </p>
                  </Grid>{auth.user.username !== props.project.details.author_name &&
                    <Grid item xs={6}>
                    </Grid>}
                </Grid>
              </Paper>
            ))}
          </TabPanel>}
          {stateList && ((tab === 1 && props.project.reports.approved[0]) || (tab === 0 && reportStatus)) && auth.roles?.is_type_reviewer && auth.user.username !== props.project.details.author_name &&
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              autoWidth
              style={{ width: '50%' }}
              onChange={handleSelectChange}
              value={status}
              variant='outlined'
            >
              {stateList.map((item, index) =>
                (
                  <MenuItem key={index} value={item}>{item}</MenuItem>
                ))}
            </Select>}
        </DialogContent>
        {auth.roles && <DialogActions>
          {auth.user.username !== props.project.details.author_name && props.project.reports.approved[0] && auth.roles?.is_type_reviewer && tab === 1 && <Button onClick={() => {
            dispatch(resolveReports(props.project.details.project_id, status))
            handleReportDetailsOpen()
          }}>Resolve All Reports</Button>}
          {auth.roles?.is_type_reviewer && (reportStatus) &&
            <Button onClick={() => {
              onClick('Change State')
            }}>Approve Reports</Button>}
          <Button onClick={handleReportDetailsOpen}>Close</Button>
        </DialogActions>}

      </Dialog>
    </Paper>}</>

  )
}

ReportComponent.propTypes = {
  location: PropTypes.object,
  children: PropTypes.node,
  classes: PropTypes.object,
  onClose: PropTypes.bool,
  project: PropTypes.object,
  changedStatus: PropTypes.func
}

export default ReportComponent
