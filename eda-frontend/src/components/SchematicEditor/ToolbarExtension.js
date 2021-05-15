import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import api from '../../utils/Api'
import {
  Slide,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextareaAutosize,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Grid,
  Paper,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar,
  Tooltip,
  Snackbar
} from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSchematics, fetchSchematic, loadGallery, fetchAllLibraries, fetchCustomLibraries, fetchLibrary, removeLibrary, uploadLibrary, resetUploadSuccess, deleteLibrary } from '../../redux/actions/index'
import GallerySchSample from '../../utils/GallerySchSample'
import { blue } from '@material-ui/core/colors'
import { Alert } from '@material-ui/lab'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

var FileSaver = require('file-saver')

// Dialog box to display generated netlist
export function NetlistModal ({ open, close, netlist }) {
  const netfile = useSelector(state => state.netlistReducer)
  const createNetlistFile = () => {
    var titleA = netfile.title.split(' ')[1]
    var blob = new Blob([netlist], { type: 'text/plain;charset=utf-8' })
    FileSaver.saveAs(blob, `${titleA}_eSim_on_cloud.cir`)
  }
  return (
    <Dialog
      open={open}
      onClose={close}
      TransitionComponent={Transition}
      keepMounted
      aria-labelledby="generate-netlist"
      aria-describedby="generate-netlist-description"
    >
      <DialogTitle id="generate-netlist-title">{'Netlist Generator'}</DialogTitle>
      <DialogContent dividers>
        <DialogContentText id="generate-netlist-description">
          Current Netlist for given schematic...<br /><br />
          <TextareaAutosize aria-label="empty textarea" rowsMin={20} rowsMax={50} style={{ minWidth: '500px' }} value={netlist} />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {/* Button to download the netlist */}
        <Button color="primary" onClick={createNetlistFile}>
          Download
        </Button>
        <Button onClick={close} color="primary" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

NetlistModal.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  netlist: PropTypes.string
}

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative'
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1
  },
  header: {
    padding: theme.spacing(5, 0, 6),
    color: '#fff'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    backgroundColor: '#404040',
    color: '#fff'
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: blue[100],
    color: blue[600]
  }
}))

// Screen to display information about as keyboard shortcuts, units table and simulation modes
export function HelpScreen ({ open, close }) {
  const classes = useStyles()
  return (
    <div>
      <Dialog fullScreen open={open} onClose={close} TransitionComponent={Transition} PaperProps={{
        style: {
          backgroundColor: '#4d4d4d',
          boxShadow: 'none'
        }
      }} >
        <AppBar position="static" elevation={0} className={classes.appBar}>
          <Toolbar variant="dense" style={{ backgroundColor: '#404040' }} >
            <IconButton edge="start" color="inherit" onClick={close} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Help
            </Typography>
            <Button autoFocus color="inherit" onClick={close}>
              close
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" className={classes.header}>
          <Grid
            container
            spacing={3}
            direction="row"
            justify="center"
            alignItems="center"
          >

            <Grid item xs={12} sm={12}>
              <Paper className={classes.paper}>
                <fieldset style={{ padding: '20px 40px' }}>
                  <legend>
                    <Typography variant="h5" align="center" component="p" gutterBottom>
                      Keyboard Shorcuts
                    </Typography>
                  </legend>
                  <Typography variant="h6" align='left' gutterBottom>
                    UNDO
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    Ctrl + Z
                  </Typography>
                  <Divider />
                  <Typography variant="h6" align='left' gutterBottom>
                    REDO
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    Ctrl + A
                  </Typography>
                  <Divider />
                  <Typography variant="h6" align='left' gutterBottom>
                    ZOOM IN
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    Ctrl + I
                  </Typography>
                  <Divider />
                  <Typography variant="h6" align='left' gutterBottom>
                    ZOOM OUT
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    Ctrl + O
                  </Typography>
                  <Divider />
                  <Typography variant="h6" align='left' gutterBottom>
                    DEFAULT SIZE
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    Ctrl + Y
                  </Typography>
                </fieldset>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={12}>
              <Paper className={classes.paper}>
                <fieldset style={{ padding: '20px 40px' }}>
                  <legend>
                    <Typography variant="h5" align="center" component="p" gutterBottom>
                      Units Table
                    </Typography>
                  </legend>
                  <Typography>

                    <TableContainer component={Paper}>
                      <Table className={classes.table} aria-label="simple table">
                        <caption>Ngspice scale factors naming conventions</caption>
                        <TableHead>
                          <TableRow>
                            <TableCell align="center">SUFFIX</TableCell>
                            <TableCell align="center">NAME</TableCell>
                            <TableCell align="center">FACTOR</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>

                          <TableRow>
                            <TableCell align="center">T</TableCell>
                            <TableCell align="center">Tera</TableCell>
                            <TableCell align="center">10<sup>12</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">G</TableCell>
                            <TableCell align="center">Giga</TableCell>
                            <TableCell align="center">10<sup>9</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">Meg</TableCell>
                            <TableCell align="center">Mega</TableCell>
                            <TableCell align="center">10<sup>6</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">K</TableCell>
                            <TableCell align="center">Kilo</TableCell>
                            <TableCell align="center">10<sup>3</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">mil</TableCell>
                            <TableCell align="center">Mil</TableCell>
                            <TableCell align="center">25.4 X 10<sup>-6</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">m</TableCell>
                            <TableCell align="center">milli</TableCell>
                            <TableCell align="center">10<sup>-3</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">u</TableCell>
                            <TableCell align="center">micro</TableCell>
                            <TableCell align="center">10<sup>-6</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">n</TableCell>
                            <TableCell align="center">nano</TableCell>
                            <TableCell align="center">10<sup>-9</sup></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell align="center">p</TableCell>
                            <TableCell align="center">pico</TableCell>
                            <TableCell align="center">10<sup>-12</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">f</TableCell>
                            <TableCell align="center">femto</TableCell>
                            <TableCell align="center">10<sup>-15</sup></TableCell>
                          </TableRow>

                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Typography>
                </fieldset>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Paper className={classes.paper}>
                <fieldset style={{ padding: '20px 40px' }}>
                  <legend>
                    <Typography variant="h5" align="center" component="p" gutterBottom>
                      Simulation Modes
                    </Typography>
                  </legend>
                  <Typography variant="h6" align='left' gutterBottom>
                    DC Solver
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    A DC simulation attempts to find a stable DC solution of your circuit.
                  </Typography>
                  <Divider />
                  <Typography variant="h6" align='left' gutterBottom>
                    DC Sweep
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    A DC Sweep will plot the DC solution of your circuit across different values of a parameter of a circuit element.
                    You can sweep any numerical parameter of any circuit element in your circuit.
                  </Typography>
                  <Divider />
                  <Typography variant="h6" align='left' gutterBottom>
                    Transient Analysis
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    A Transient analysis does a Time-Domain Simulation of your circuit over a certain period of time.
                  </Typography>
                  <Divider />
                  <Typography variant="h6" align='left' gutterBottom>
                    AC Analysis
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    AC Analysis does a small signal analysis of your circuit. The input can be any voltage source or current source.
                  </Typography>
                </fieldset>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Dialog>
    </div >
  )
}

HelpScreen.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func
}

// Image Export Dialog box
const ImgTypes = ['PNG', 'JPG', 'SVG']
export function ImageExportDialog (props) {
  const classes = useStyles()
  const { onClose, open } = props

  const handleClose = () => {
    onClose('')
  }

  const handleListItemClick = (value) => {
    onClose(value)
  }

  return (
    <Dialog onClose={handleClose} aria-labelledby="image-export-dialog-title" open={open}>
      <DialogTitle id="image-export-dialog-title">Select Image type</DialogTitle>
      <List>
        {ImgTypes.map((img) => (
          <ListItem button onClick={() => handleListItemClick(img)} key={img}>
            <ListItemAvatar>
              <Avatar className={classes.avatar}>
                {img.charAt(0).toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={img} />
          </ListItem>
        ))}
      </List>
      <DialogActions>
        <Button onClick={handleClose} color="primary" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ImageExportDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
}

// Dialog box to open saved Schematics
export function OpenSchDialog (props) {
  const { open, close, openLocal } = props
  const [isLocal, setisLocal] = React.useState(true)
  const [isGallery, setisGallery] = React.useState(false)
  const schSave = useSelector(state => state.saveSchematicReducer)
  const auth = useSelector(state => state.authReducer)
  const schematics = useSelector(state => state.dashboardReducer.schematics)

  function getDate (jsonDate) {
    var json = jsonDate
    var date = new Date(json)
    const dateTimeFormat = new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const [{ value: month }, , { value: day }, , { value: hour }, , { value: minute }, , { value: second }] = dateTimeFormat.formatToParts(date)
    return `${day} ${month} ${hour}:${minute}:${second}`
  }

  const dispatch = useDispatch()

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth='md'
      TransitionComponent={Transition}
      keepMounted
      aria-labelledby="open-dialog-title"
      aria-describedby="open-dialog-description"
    >
      <DialogTitle id="open-dialog-title" onClose={close}>
        <Typography variant="h6">{'Open Schematic'}</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText id="open-dialog-description" >
          {isLocal
            ? <center> <Button variant="outlined" fullWidth={true} size="large" onClick={() => { openLocal(); close() }} color="primary">
              Upload File
            </Button></center>
            : isGallery
              ? <Grid item xs={12} sm={12}>
                {/* Listing Gallery Schematics */}
                <TableContainer component={Paper} style={{ maxHeight: '45vh' }}>
                  <Table stickyHeader size="small" aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Name</TableCell>
                        <TableCell align="center">Description</TableCell>
                        <TableCell align="center">Launch</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <>
                        {GallerySchSample.map(
                          (sch) => {
                            return (
                              <TableRow key={sch.save_id}>
                                <TableCell align="center">{sch.name}</TableCell>
                                <TableCell align="center">
                                  <Tooltip title={sch.description !== null ? sch.description : 'No description'} >
                                    <span>
                                      {sch.description !== null ? sch.description.slice(0, 30) + (sch.description.length < 30 ? '' : '...') : '-'}
                                    </span>
                                  </Tooltip>
                                </TableCell>
                                <TableCell align="center">
                                  <Button
                                    size="small"
                                    color="primary"
                                    onClick={() => { dispatch(loadGallery(sch.save_id.substr(7, sch.save_id.length))) }}
                                    variant={schSave.details.save_id === undefined ? 'outlined' : schSave.details.save_id !== sch.save_id ? 'outlined' : 'contained'}
                                  >
                                    Launch
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          }
                        )}
                      </>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              : <Grid item xs={12} sm={12}>
                {/* Listing Saved Schematics */}
                {schematics.length === 0
                  ? <Typography variant="subtitle1" gutterBottom>
                  Hey {auth.user.username} , You dont have any saved schematics...
                  </Typography>
                  : <TableContainer component={Paper} style={{ maxHeight: '45vh' }}>
                    <Table stickyHeader size="small" aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">Name</TableCell>
                          <TableCell align="center">Description</TableCell>
                          <TableCell align="center">Created</TableCell>
                          <TableCell align="center">Updated</TableCell>
                          <TableCell align="center">Launch</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <>
                          {schematics.map(
                            (sch) => {
                              return (
                                <TableRow key={sch.save_id}>
                                  <TableCell align="center">{sch.name}</TableCell>
                                  <TableCell align="center">
                                    <Tooltip title={sch.description !== null ? sch.description : 'No description'} >
                                      <span>
                                        {sch.description !== null ? sch.description.slice(0, 30) + (sch.description.length < 30 ? '' : '...') : '-'}
                                      </span>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell align="center">{getDate(sch.create_time)}</TableCell>
                                  <TableCell align="center">{getDate(sch.save_time)}</TableCell>
                                  <TableCell align="center">
                                    <Button
                                      size="small"
                                      color="primary"
                                      onClick={() => { dispatch(fetchSchematic(sch.save_id)) }}
                                      variant={schSave.details.save_id === undefined ? 'outlined' : schSave.details.save_id !== sch.save_id ? 'outlined' : 'contained'}
                                    >
                                    Launch
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            }
                          )}
                        </>
                      </TableBody>
                    </Table>
                  </TableContainer>
                }
              </Grid>
          }
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant={isLocal ? 'outlined' : 'text' } onClick={() => { setisLocal(true); setisGallery(false) }} color="secondary">
          Local
        </Button>
        <Button variant={isGallery ? 'outlined' : 'text' } onClick={() => { setisLocal(false); setisGallery(true) }} color="secondary">
          Gallery
        </Button>
        {auth.isAuthenticated !== true
          ? <></>
          : <Button variant={!isGallery & !isLocal ? 'outlined' : 'text' } onClick={() => { dispatch(fetchSchematics()); setisLocal(false); setisGallery(false) }} color="secondary" >
            on Cloud
          </Button>
        }
        <Button onClick={close} color="primary" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

OpenSchDialog.propTypes = {
  close: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  openLocal: PropTypes.func.isRequired
}

function SimpleSnackbar ({ open, close, message }) {
  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={open}
        autoHideDuration={4000}
        onClose={close}
        message={message}
        action={
          <React.Fragment>
            <IconButton size="small" aria-label="close" color="inherit" onClick={close}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  )
}

SimpleSnackbar.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  message: PropTypes.string
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
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

function LibraryCard({library}) {
  const dispatch = useDispatch()

  const handleAppply = (lib) => {
    dispatch(fetchLibrary(lib))
  }

  const handleUnapply = (lib) => {
    dispatch(removeLibrary(lib))
  }

  return (
    <Grid item xs={3} sm={3}>
      <Card variant="outlined">
        <CardContent>
          <Typography component="p">
            {library.library_name}
          </Typography>
        </CardContent>
        <div style={{margin: "10px"}}>
          { !library.default && 
            <Button variant="contained" size="small" 
              style={{marginRight: "10px", backgroundColor: "#ff1744", color: "#ffffff"}}
              onClick={() => { dispatch(deleteLibrary(library)) }}>
              Delete
            </Button>
          }
          { library.active
            ? <Button variant="contained" size="small" color="secondary"
              onClick={ () => { handleUnapply(library) }} >
              Remove
            </Button>
            : <Button variant="contained" size="small" color="primary"
              onClick={ () => { handleAppply(library) }} >
              Use
            </Button>
          }
        </div>
      </Card>
    </Grid>
  )
}

export function SelectLibrariesModal (props) {
  const {open, close, auth } = props
  const allLibraries = useSelector(state => state.schematicEditorReducer.allLibraries)
  const libraries = useSelector(state => state.schematicEditorReducer.libraries)
  var uploadSuccess = useSelector(state => state.schematicEditorReducer.uploadSuccess)
  const dispatch = useDispatch()
  const classes = useStyles()
  const [activeLibraries, setActiveLibraries] = React.useState(allLibraries)
  const [message, setMessage] = React.useState("")
  const [uploadDisable, setUploadDisable] = React.useState(false)
  const [tabValue, setTabValue] = React.useState(0)

  useEffect(() => {
    if (open == true)
      dispatch(fetchAllLibraries())
  }, [dispatch, open])

  useEffect(() => {
    setUploadDisable(false)
    if(uploadSuccess == true){
      setMessage("Upload Successful")
      setsnacOpen(true)
      dispatch(resetUploadSuccess())
      dispatch(fetchAllLibraries())
    }
    if(uploadSuccess == false){
      setMessage("An Error Occured")
      setsnacOpen(true)
      dispatch(resetUploadSuccess())
    }
  }, [uploadSuccess])

  const updateActive = () => {
    var active = []
    if( allLibraries != undefined)
    allLibraries.forEach( (element) => {
      element.active = false
      libraries.forEach( ele => {
        if(ele.id == element.id) {
          element.active = true
        }
      })
      active.push(element)
    })
    setActiveLibraries(active)
  }

  useEffect(() => {
    if(allLibraries != undefined){
      updateActive();
    }
  }, [libraries, allLibraries])

  const fileUpload = React.useRef(null)

  const handlFileUpload = () => {
    setUploadDisable(true)
    var files = event.target.files
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }
    dispatch(uploadLibrary(formData))
  }

  const handleLibUploadOpen = () => {
    fileUpload.current.click();
  }

  const [snacOpen, setsnacOpen] = React.useState(false)
  const handleSnacClose = () => {
    setsnacOpen(false)
  }

  const handleTabChange = (event, value) => {
    setTabValue(value)
  }

  return (
    <Dialog
    open={open}
    onClose={close}
    fullWidth
    maxWidth="md"
    TransitionComponent={Transition}
    aria-labelledby="open-dialog-title"
    aria-describedby="open-dialog-description"
    >
      <DialogTitle>
        <Typography variant="h6">{'Manage libraries in the workspace'}</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText id="open-dialog-description" >
          <Paper className={classes.root}>
            <Tabs value={tabValue} onChange={handleTabChange} centered color="primary">
              <Tab label="DEFAULT" />
              <Tab label="UPLOADED" />
              <Tab label="ACTIVE" />
            </Tabs>
          </Paper>
          { activeLibraries !== undefined
              ? 
              <center>
                <TabPanel value={tabValue} index={0}>
                  <Grid container
                  spacing={3}
                  align="center"
                  justify="center"
                  direction="row">
                    {activeLibraries.map((library, i) => {
                      if(library.default)
                        return <LibraryCard library={library} />
                    })}
                  </Grid>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <Grid container
                  spacing={3}
                  align="center"
                  justify="center"
                  direction="row">
                    {activeLibraries.map((library, i) => {
                      if(!library.default)
                        return <LibraryCard library={library} />
                    })}
                  </Grid>
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                  <Grid container
                  spacing={3}
                  align="center"
                  justify="center"
                  direction="row">
                    {activeLibraries.map((library, i) => {
                      if(library.active)
                        return <LibraryCard library={library} />
                    })}
                  </Grid>
                </TabPanel>
              </center>
              : <p>Nothing To Show</p>
          }
        </DialogContentText>
        { auth &&
            <center>
              { uploadDisable &&
                <div style={{paddingBottom: '10px'}}>
                  <Alert severity="info" >Files are being uploaded please wait.</Alert>
                </div>
              }
              <Button display="block" variant="contained" size="large" color="primary" 
                onClick={ () => { handleLibUploadOpen() }} disabled={uploadDisable} disableElevation={true}>
                Upload .lib and .dcm Files
                <input type="file" multiple={true} accept=".lib,.dcm" ref={ fileUpload } onChange={ handlFileUpload } style={{display: 'none'}} />
              </Button>
              <SimpleSnackbar open={snacOpen} close={handleSnacClose} message={message} />
            </center>
        }
      </DialogContent>
    </Dialog>
  )
}