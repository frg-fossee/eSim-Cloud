// Main Layout for Schemaic Editor page.
/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
import React, { useEffect } from 'react'
import {
  Button,
  Typography,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  Tooltip,
  Snackbar,
  TextField,
  DialogActions,
  List,
  ListItem
} from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import LayoutMain from '../components/Shared/LayoutMain'
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import LoadGrid from '../components/SchematicEditor/Helper/ComponentDrag.js'
import '../components/SchematicEditor/Helper/SchematicEditor.css'
import { fetchSchematic, loadGallery, reportProject, makeCopy } from '../redux/actions/index'
import { useDispatch, useSelector } from 'react-redux'
import SimulationProperties from '../components/SchematicEditor/SimulationProperties'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import ZoomOutIcon from '@material-ui/icons/ZoomOut'
import SettingsOverscanIcon from '@material-ui/icons/SettingsOverscan'
import MuiAlert from '@material-ui/lab/Alert'
import { ZoomIn, ZoomOut, ZoomAct, GenerateCompList, GenerateNetList } from '../components/SchematicEditor/Helper/ToolbarTools'
import ReportComponent from '../components/Project/ReportComponent'
import ChangeStatus from '../components/Project/ChangeStatus'
import { NetlistModal } from '../components/SchematicEditor/ToolbarExtension'
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    minHeight: '30vh'

  },
  toolbar: {
    minHeight: '20px'
  }
}))

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

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}
function getDate (jsonDate) {
  var json = jsonDate
  var date = new Date(json)
  const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' })
  const [{ value: month }, , { value: day }, , { value: year }] = dateTimeFormat.formatToParts(date)
  return `${day}-${month}-${year}`
}

export default function ProjectPage(props) {
  const classes = useStyles()
  const gridRef = React.createRef()
  const dispatch = useDispatch()
  const [netListOpen, setNetListOpen] = React.useState(false)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [simulateOpen, setSimulateOpen] = React.useState(false)
  const [reportOpen, setReportOpen] = React.useState(false)
  const [reportDescription, setDescription] = React.useState(null)
  const [netlist, genNetlist] = React.useState('')
  const [statusChanged, setStatusChanged] = React.useState(false)
  const project = useSelector(state => state.projectReducer)
  const auth = useSelector(state => state.authReducer)
  const netfile = useSelector((state) => state.netlistReducer)
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
  const handleSimulateOpen = () => {
    setSimulateOpen(!simulateOpen)
  }
  const handleReportOpen = () => {
    setReportOpen(!reportOpen)
  }
  const handleChangeDescription = (e) => {
    setDescription(e.target.value)
  }
  const handleNetlistClick = () => {
    setNetListOpen(!netListOpen)
  }
  const onClick = (type) => {
    const query = new URLSearchParams(props.location.search)
    var save_id = query.get('save_id')
    var project_id = query.get('project_id')
    switch (type) {
      case 'Report':
        dispatch(reportProject(reportDescription, project_id))
        handleReportOpen()
        break
      case 'Make copy':
        dispatch(makeCopy(save_id, project.details.active_version, project.details.active_branch))
        setSnackbarOpen(true)
        break
      case 'Generate Netlist':
        var compNetlist = GenerateNetList()
        var netlist =
          netfile.title +
          '\n\n' +
          compNetlist.models +
          '\n' +
          compNetlist.main +
          '\n' +
          netfile.controlLine +
          '\n' +
          netfile.controlBlock +
          '\n'
        genNetlist(netlist)
        handleNetlistClick()
        break
      default:
        break
    }
  }

  const changedStatus = () => {
    setStatusChanged(true)
  }
  useEffect(() => {
    var container = gridRef.current
    LoadGrid(container, null, null)
    if (props.location.search !== '') {
      const query = new URLSearchParams(props.location.search)
      var saveID = query.get('save_id')
      var version = query.get('version')
      var branch = query.get('branch')
      if (saveID.substr(0, 7) === 'gallery') {
        // Loading Gallery schemaic.
        dispatch(loadGallery(saveID.substr(7, saveID.length)))
      } else {
        // Loading User on-cloud saved schemaic.
        dispatch(fetchSchematic(saveID, version, branch))
      }
    }
    console.log(GenerateCompList())
    // eslint-disable-next-line
  }, [props.location, dispatch])
  return (
    <div className={classes.root}>
      <LayoutMain>
        {project.details !== '401'
          ? <>
            {statusChanged
              ? <>
                Status Changed
              </> : <Grid container>
                <Grid item xs={1} />
                <Grid item xs={10}>
                  <div className={classes.toolbar} />
                  <Typography>
                    {project.details && <h1 style={{ marginBottom: '0' }}>{project.details.title}</h1>}
                    {project.details && <h4 style={{ marginTop: '0' }}>By: {project.details.author_name} </h4>}
                  </Typography>
                  {project.reports && project.details.is_reported &&
                    <ReportComponent project={project} changedStatus={changedStatus} location={props.location} />
                  }
                  {project.details && !project.details?.is_reported && project.details?.author_name !== auth.user?.username &&
                    <ChangeStatus project={project} changedStatus={changedStatus} />
                  }
                  <Typography>
                    <h3>{project.details?.description}</h3>
                    {project.details && project.details?.fields && project.details.fields.map(item => (
                      <p key={item}>
                        <h2 style={{ marginTop: '0' }}>{item.name}</h2>
                        <h3 style={{ marginTop: '0' }}>{item.text}</h3>
                      </p>
                    ))}
                  </Typography>

                  <Dialog
                    open={simulateOpen}
                    onClose={handleSimulateOpen}
                  >
                    <DialogTitle onClose={handleSimulateOpen}>Simulate Circuit</DialogTitle>
                    <DialogContent style={{ padding: '3%' }}>
                      <SimulationProperties />
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={reportOpen}
                    onClose={handleReportOpen}
                    fullWidth={true}
                    maxWidth={'md'} >
                    <DialogTitle>Report this project</DialogTitle>
                    <DialogContent style={{ padding: '3%' }}>
                      <TextField
                        multiline
                        variant="outlined"
                        label="Report Description"
                        style={{ width: '100%' }}
                        value={reportDescription}
                        error={!reportDescription}
                        helperText={'Please enter description'}
                        onChange={handleChangeDescription}
                        rows={8} />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => onClick('Report')}>Report</Button>
                      <Button onClick={handleReportOpen}>Cancel</Button>
                    </DialogActions>
                  </Dialog>

                  <h1>Circuit Diagram:
                    {auth.isAuthenticated && <Button variant="contained" style={{ float: 'right', backgroundColor: 'red', color: 'white', marginTop: '.5%' }} onClick={() => handleReportOpen()}>Report</Button>}
                    {auth.isAuthenticated && <Button variant="contained" color="primary" style={{ float: 'right', margin: '.5% .5% 0 0%' }} onClick={() => onClick('Make copy')}>Make a Copy</Button>}
                    <Button style={{ float: 'right', backgroundColor: 'lightgreen', margin: '.5% .5% 0 0' }} variant="contained" onClick={() => handleSimulateOpen()}>
                      <PlayCircleOutlineIcon />Simulate
                    </Button>
                    <Button variant="contained" color="primary" style={{ float: 'right', margin: '.5% .5% 0 0%' }} onClick={() => onClick('Generate Netlist')}>Generate Netlist</Button>
                  </h1>
                  <NetlistModal open={netListOpen} close={handleNetlistClick} netlist={netlist} />
                  <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                  >
                    <Alert onClose={() => setSnackbarOpen(false)} severity="success">
                      Successfully made a copy!
                    </Alert>
                  </Snackbar>
                  <Grid container>
                    <Grid item xs={1}>
                      <Paper style={{ width: '30px' }}>
                        <div>
                          <Tooltip title="Zoom In">
                            <IconButton color="inherit" className={classes.tools} size="small" onClick={ZoomIn}>
                              <ZoomInIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                        <div>
                          <Tooltip title="Zoom Out">
                            <IconButton color="inherit" className={classes.tools} size="small" onClick={ZoomOut}>
                              <ZoomOutIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                        <div>
                          <Tooltip title="Default Size">
                            <IconButton color="inherit" className={classes.tools} size="small" onClick={ZoomAct}>
                              <SettingsOverscanIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </Paper>
                    </Grid>
                    <Grid item xs={10}>
                      <div className="grid-container A4-L" ref={gridRef} id="divGrid" />
                    </Grid>
                    <Grid item xs={1} />

                    <Grid item xs={12} sm={12}>
                      <Paper style={{ padding: '2%', marginTop: '3%' }}>
                        <List>
                          <h3>History of this Project</h3>
                          {project.details?.history[0]
                            ? <>
                              {project.details.history.slice(0).reverse().map((item, index) => (
                                <ListItem key={index}>
                                  <p style={{ margin: '0%' }}>{index + 1}. {item.from_state_name} to {item.to_state_name}
                                    <br />
                                    <h5>-On {getDate(item.transition_time)} by {item.transition_author_name}</h5>
                                    {item.reviewer_notes && <h5>-Notes: {item.reviewer_notes}</h5>}
                                  </p>
                                </ListItem>
                              ))}</>
                            : <h4>No history of this project.</h4>
                          }
                        </List>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={1} />
              </Grid>}
          </>
          : <>
            {statusChanged ? <>Status Changed. Wait for it to get back to the status where it is visible for you.</> : <>Not Authorized</>}
          </>}

      </LayoutMain>
    </div>
  )
}
