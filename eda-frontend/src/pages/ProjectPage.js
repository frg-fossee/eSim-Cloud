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
  List
} from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import ComponentProperties from '../components/SchematicEditor/ComponentProperties'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import LayoutMain from '../components/Shared/LayoutMain'
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import LoadGrid from '../components/SchematicEditor/Helper/ComponentDrag.js'
import '../components/SchematicEditor/Helper/SchematicEditor.css'
import { fetchSchematic, fetchGallerySchematic, reportProject, makeCopy } from '../redux/actions/index'
import { useDispatch, useSelector } from 'react-redux'
import SimulationProperties from '../components/SchematicEditor/SimulationProperties'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import ZoomOutIcon from '@material-ui/icons/ZoomOut'
import SettingsOverscanIcon from '@material-ui/icons/SettingsOverscan'
import MuiAlert from '@material-ui/lab/Alert'
import { ZoomIn, ZoomOut, ZoomAct, GenerateDetailedCompList, GenerateNetList } from '../components/SchematicEditor/Helper/ToolbarTools'
import ReportComponent from '../components/Project/ReportComponent'
import ChangeStatus from '../components/Project/ChangeStatus'
import { NetlistModal } from '../components/SchematicEditor/ToolbarExtension'
import ProjectTimeline from '../components/Project/ProjectTimeline'
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    overflowX: 'visible',
    overflowY: 'hidden',
    backgroundColor: '#f4f6f8'

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

function Alert (props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}
export default function ProjectPage (props) {
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
  const [componentsList, setComponentsList] = React.useState(undefined)
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
    console.log(project.details)
  }, [project])
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
        dispatch(fetchGallerySchematic(saveID))
      } else {
        // Loading User on-cloud saved schemaic.
        dispatch(fetchSchematic(saveID, version, branch))
      }
    }
    setTimeout(() => {
      setComponentsList([GenerateDetailedCompList()])
    }, 2000)
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
                  {project.reports && project.details.is_reported &&
                    <ReportComponent project={project} changedStatus={changedStatus} location={props.location} />
                  }
                  {project.details && !project.details?.is_reported && project.details?.author_name !== auth.user?.username &&
                    <ChangeStatus project={project} changedStatus={changedStatus} />
                  }
                  <Paper style={{ padding: '1%', marginTop: '2%', borderRadius: '12px' }}>
                    <Typography>
                      {project.details && <h1 style={{ marginTop: '0', marginBottom: '0' }}>{project.details.title}</h1>}
                      {project.details && <h4 style={{ marginTop: '0', marginBottom: '0' }}>By: {project.details.author_name} </h4>}
                    </Typography>
                    <hr style={{ marginTop: '0' }} />

                    <Typography>
                      <h3>{project.details?.description}</h3>
                      {componentsList && <h2 style={{ marginBottom: '0' }}>Component List:</h2>}
                      {componentsList && componentsList[0].map((item, i) => (<div key={i}>{i + 1}.{item.name}  {item.value}{item.unit}</div>))}
                      {project.details && project.details?.fields && project.details.fields.map(item => (
                        <p key={item}>
                          <h3 style={{ marginTop: '0', marginBottom: '0' }}>{item.name}:</h3>
                          <p style={{ marginTop: '0' }}>
                            {item.text.split('\n').map((text) => (
                              <span key={text}>
                                {text}
                                <br></br>
                              </span>
                            ))}
                          </p>
                        </p>
                      ))}
                    </Typography>

                    <Dialog
                      open={simulateOpen}
                      onClose={handleSimulateOpen}
                    >
                      <DialogTitle onClose={handleSimulateOpen}>Simulate Circuit</DialogTitle>
                      <DialogContent style={{ padding: '3%' }}>
                        {project.details && <SimulationProperties
                          dcSweepcontrolLine={project.details.dc_sweep}
                          transientAnalysisControlLine={project.details.transient_analysis}
                          acAnalysisControlLine={project.details.ac_analysis}
                          tfAnalysisControlLine={project.details.tf_analysis}
                        />}
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
                  </Paper>
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
                      <LayoutMain>
                        <center>
                          <div className="grid-container A4-L" ref={gridRef} id="divGrid" />
                        </center>
                      </LayoutMain>
                    </Grid>
                    <ComponentProperties />
                    <Grid item xs={1} />

                    <Grid item xs={12} sm={12}>
                      <Paper style={{ padding: '0 2%', margin: '3% 0', borderRadius: '12px' }}>
                        <List>
                          <h3>History of this Project</h3>
                          {project.details?.history[0]
                            ? <ProjectTimeline history={project.details.history.slice(0).reverse()} isOwner={auth.user?.username === project.details.author_name} />
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
