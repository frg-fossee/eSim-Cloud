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
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles'
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { approveReports, fetchRole, getStatus, resolveReports } from '../../redux/actions/index'
import { useDispatch, useSelector } from 'react-redux'

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});
function TabPanel(props) {
  const { children, value, index, ...other } = props;

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
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}



function ReportComponent(props) {
  const [reportDetailsOpen, setReportDetailsOpen] = React.useState(false)
  const [status, setStatus] = React.useState(null)
  const [reportStatus, setReportStatus] = React.useState(null)
  const [tab, setTab] = React.useState(0)
  const [reportApproved, setReportApproved] = React.useState(false)
  const auth = useSelector(state => state.authReducer)
  const stateList = useSelector(state => state.publicationReducer.states)
  const dispatch = useDispatch()

  useEffect(() => {
    const query = new URLSearchParams(props.location.search)
    var publication_id = query.get('publication_id')
    dispatch(fetchRole())
    if (!reportDetailsOpen) {
      dispatch(getStatus(publication_id))
    }
  }, [props.location.search, dispatch, reportDetailsOpen])

  const handleChangeTab = (event, newValue) => {
    setTab(newValue);
  };
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
    }
    else {
      temp = []
    }
    var report = { 'id': report_id, approved: e.target.value }
    temp.push(report)
    //TODO: Make this check better
    if (e.target.value === true) {
      setReportApproved(true)
    }
    setReportStatus(temp)
  }
  const onClick = (type) => {
    const query = new URLSearchParams(props.location.search)
    var publication_id = query.get('publication_id')
    switch (type) {
      case "Change State":
        dispatch(approveReports(publication_id, reportStatus, status))
        handleReportDetailsOpen()
        break;
      default:
        break;
    }
  }
  const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  });
  return (
    <>{auth.user && <Paper style={{ padding: '0.06% 1%' }}>

      <h3 style={{ color: 'red' }}>This is a reported publication
    <Button style={{ float: 'right', verticalAlign: 'super' }} onClick={handleReportDetailsOpen}>View Reports</Button></h3>
      <Dialog
        open={reportDetailsOpen}
        onClose={(handleReportDetailsOpen)}
        fullWidth={true}
        maxWidth={'md'}>
        <DialogTitle style={{ paddingBottom: '0' }}><h1 style={{ marginBottom: '0', marginTop: '0' }}>Reports</h1></DialogTitle>
        <DialogContent>
          <Tabs value={tab} onChange={handleChangeTab}>
            {auth.user.username !== props.publication.details.author_name && <Tab label="Open Reports"  {...a11yProps(0)} />}
            <Tab label="Approved Reports"  {...a11yProps(1)} />
            {auth.user.username !== props.publication.details.author_name && <Tab label="Closed Reports"  {...a11yProps(2)} />}
          </Tabs>
          {auth.user.username !== props.publication.details.author_name && <TabPanel value={tab} index={0}>
            {props.publication.reports.open[0] ? <h3 style={{ marginTop: '0' }}>Do you want to approve any reports?</h3> : <h3 style={{ marginTop: '0' }}>No open reports</h3>}
            {props.publication.reports && props.publication.reports.open.map((item, index) => (
              <Paper style={{ margin: '1% .2%', padding: '.5% .7%' }}>
                <Grid container>
                  <Grid item xs={6}>
                    <p>
                      {item.description}
                    </p>
                  </Grid>{auth.user.username !== props.publication.details.author_name &&
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
            ))}
          </TabPanel>}
          <TabPanel value={tab} index={auth.user.username !== props.publication.details.author_name ? 1 : 0}>
            {props.publication.reports && props.publication.reports.approved.map((item, index) => (
              <Paper style={{ margin: '1% .2%', padding: '.5% .7%' }}>
                <Grid container>
                  <Grid item xs={6}>
                    <p>
                      {item.description}
                    </p>
                  </Grid>
                  {auth.user.username !== props.publication.details.author_name &&
                    <Grid item xs={6}>
                    </Grid>}
                </Grid>
              </Paper>
            ))}
          </TabPanel>
          {auth.user.username !== props.publication.details.author_name && <TabPanel value={tab} index={2}>
            {props.publication.reports && props.publication.reports.closed.map((item, index) => (
              <Paper style={{ margin: '1% .2%', padding: '.5% .7%' }}>
                <Grid container>
                  <Grid item xs={6}>
                    <p>
                      {item.description}
                    </p>
                  </Grid>{auth.user.username !== props.publication.details.author_name &&
                    <Grid item xs={6}>
                    </Grid>}
                </Grid>

              </Paper>
            ))}
          </TabPanel>}
          {stateList && ((tab === 1 && props.publication.reports.approved[0]) || (tab === 0 && reportApproved)) && auth.user.username !== props.publication.details.author_name &&
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
                <MenuItem value={item}>{item}</MenuItem>
              ))}
            </Select>}
        </DialogContent>
        {auth.roles && <DialogActions>
          {auth.user.username !== props.publication.details.author_name && props.publication.reports.approved[0] && auth.roles.is_type_reviewer && tab === 1 && <Button onClick={() => {
            dispatch(resolveReports(props.publication.details.publication_id, status))
            handleReportDetailsOpen()
          }}>Resolve All Reports</Button>}
          {auth.roles.is_type_reviewer && (reportStatus) &&
            <Button onClick={() => {
              onClick("Change State")
            }}>Approve Reports</Button>}
          <Button onClick={handleReportDetailsOpen}>Close</Button>
        </DialogActions>}

      </Dialog>
    </Paper>}</>

  )
}

export default ReportComponent
